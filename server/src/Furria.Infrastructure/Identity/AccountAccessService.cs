using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.ClubApp;
using Furria.Application.Groups;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class AccountAccessService
{
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string DeadInvitationMessage = "Diese Einladung gilt nicht mehr.";
    private const string PasswordErrorPrefix = "Password";

    private static readonly IReadOnlySet<string> TakenLoginErrorCodes = new HashSet<string>(
        StringComparer.Ordinal
    )
    {
        nameof(IdentityErrorDescriber.DuplicateEmail),
        nameof(IdentityErrorDescriber.DuplicateUserName),
    };

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly AccountService _accountService;
    private readonly MailQueue _mailQueue;
    private readonly EmailConfirmationService _emailConfirmationService;
    private readonly AccessRecoveryService _accessRecoveryService;
    private readonly AccountClaimService _accountClaimService;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountAccessService> _logger;

    public AccountAccessService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        AccountService accountService,
        MailQueue mailQueue,
        EmailConfirmationService emailConfirmationService,
        AccessRecoveryService accessRecoveryService,
        AccountClaimService accountClaimService,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<AccountAccessService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _accountService = accountService;
        _mailQueue = mailQueue;
        _emailConfirmationService = emailConfirmationService;
        _accessRecoveryService = accessRecoveryService;
        _accountClaimService = accountClaimService;
        _clubAppOptions = clubAppOptions.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result<AccountAccessDetails>> GetAccessAsync(
        int personId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var subject = await SubjectAsync(personId, ClubClock.DayOf(now), ct);
        if (subject is null)
            return Result<AccountAccessDetails>.NotFound(UnknownPersonMessage);

        var terms = await ClubTermsAsync(ct);
        var invitation = await LiveInvitationAsync(personId, ct);
        var history = await HistoryAsync(personId, ct);

        return Result<AccountAccessDetails>.Success(
            ToDetails(subject, terms, invitation, history, now)
        );
    }

    public async Task<Result<IssuedInvitationDetails>> IssueMailInvitationAsync(
        int personId,
        InvitationIssuer issuer,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var subject = await SubjectAsync(personId, ClubClock.DayOf(now), ct);
        if (subject is null)
            return Result<IssuedInvitationDetails>.NotFound(UnknownPersonMessage);

        var terms = await ClubTermsAsync(ct);
        if (RefusalOf(subject, terms, issuer.VouchesForAge) is { } refusal)
            return Result<IssuedInvitationDetails>.Conflict(refusal);

        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var expiresAt = now + Invitation.MailLifetime;

        var saved = await RecordIssuedAsync(
            new Invitation
            {
                PersonId = personId,
                Purpose = InvitationPurpose.Onboarding,
                Channel = InvitationChannel.Mail,
                TokenHash = tokenHash,
                IssuedByPersonId = issuer.PersonId,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            },
            ct
        );
        if (!saved.IsSuccess)
            return Result<IssuedInvitationDetails>.Carrying(saved);

        _mailQueue.Enqueue(InvitationMail.Compose(ToMailContent(subject, terms, token, expiresAt)));
        _logger.LogInformation("Mail invitation issued for person {PersonId}", personId);

        return Result<IssuedInvitationDetails>.Success(
            new IssuedInvitationDetails { ExpiresAt = expiresAt }
        );
    }

    public async Task<Result<IssuedInPersonInvitationDetails>> IssueInPersonInvitationAsync(
        int personId,
        InvitationIssuer issuer,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var subject = await SubjectAsync(personId, ClubClock.DayOf(now), ct);
        if (subject is null)
            return Result<IssuedInPersonInvitationDetails>.NotFound(UnknownPersonMessage);

        if (RefusalOf(subject, await ClubTermsAsync(ct), issuer.VouchesForAge) is { } refusal)
            return Result<IssuedInPersonInvitationDetails>.Conflict(refusal);

        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var (code, codeHash) = await FreshInvitationCodeAsync(now, ct);
        var expiresAt = now + Invitation.InPersonLifetime;

        var saved = await RecordIssuedAsync(
            new Invitation
            {
                PersonId = personId,
                Purpose = InvitationPurpose.Onboarding,
                Channel = InvitationChannel.InPerson,
                TokenHash = tokenHash,
                CodeHash = codeHash,
                IssuedByPersonId = issuer.PersonId,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            },
            ct
        );
        if (!saved.IsSuccess)
            return Result<IssuedInPersonInvitationDetails>.Carrying(saved);

        _logger.LogInformation("In-person invitation issued for person {PersonId}", personId);

        return Result<IssuedInPersonInvitationDetails>.Success(
            new IssuedInPersonInvitationDetails
            {
                Link = InvitationMail.LinkOf(_clubAppOptions.BaseUrl, token),
                Code = code,
                ExpiresAt = expiresAt,
            }
        );
    }

    public async Task<Result<AccountAccessState>> GetAccessStateAsync(
        int personId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var row = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Select(person => new
            {
                AccountIsDisabled = _dbContext
                    .Users.Where(account => account.PersonId == person.Id)
                    .Select(account => (bool?)account.IsDisabled)
                    .FirstOrDefault(),
                HasUnexpiredLiveInvitation = _dbContext.Invitations.Any(invitation =>
                    invitation.PersonId == person.Id
                    && invitation.RedeemedAt == null
                    && invitation.VoidedAt == null
                    && invitation.ExpiresAt > now
                ),
            })
            .SingleOrDefaultAsync(ct);

        return row is null
            ? Result<AccountAccessState>.NotFound(UnknownPersonMessage)
            : Result<AccountAccessState>.Success(
                AccountEligibility.StateOf(row.AccountIsDisabled, row.HasUnexpiredLiveInvitation)
            );
    }

    public async Task<InvitationLookupDetails?> LookUpAsync(
        InvitationCredential credential,
        CancellationToken ct
    )
    {
        if (await _accessRecoveryService.LookUpAsync(credential, ct) is { } recovery)
            return recovery;

        var redeemable = await RedeemableAsync(credential, _timeProvider.GetUtcNow(), ct);
        if (redeemable is null)
            return null;

        var contactEmailTaken = await IsLoginEmailTakenAsync(
            NormalizedEmailOf(redeemable.ContactEmail),
            ct
        );
        var contactEmailClaimable =
            contactEmailTaken
            && await _accountClaimService.IsClaimableAsync(
                NormalizedEmailOf(redeemable.ContactEmail),
                ct
            );

        return new InvitationLookupDetails
        {
            FirstName = redeemable.FirstName,
            LoginEmail = contactEmailTaken ? null : redeemable.ContactEmail,
            ContactEmailTaken = contactEmailTaken,
            Purpose = InvitationPurpose.Onboarding,
            ClaimableLoginEmail = contactEmailClaimable ? redeemable.ContactEmail : null,
        };
    }

    public async Task<Result<RedemptionDetails>> RedeemAsync(
        RedeemInvitationCommand command,
        CancellationToken ct
    )
    {
        if (await _accessRecoveryService.IsRecoveryAsync(command.Credential, ct))
            return await _accessRecoveryService.RecoverAsync(command, ct);

        var now = _timeProvider.GetUtcNow();
        var redeemable = await RedeemableAsync(command.Credential, now, ct);
        if (redeemable is null)
            return Result<RedemptionDetails>.Conflict(DeadInvitationMessage);

        var loginEmail = command.LoginEmail?.Trim() ?? redeemable.ContactEmail;
        var normalizedLoginEmail = NormalizedEmailOf(loginEmail);
        if (await IsLoginEmailTakenAsync(normalizedLoginEmail, ct))
            return await _accountClaimService.ClaimOrRefuseAsync(
                new AccountClaim
                {
                    InvitationId = redeemable.InvitationId,
                    KeeperPersonId = redeemable.PersonId,
                    NormalizedLoginEmail = normalizedLoginEmail,
                    ClaimProof = command.ClaimProof,
                },
                ct
            );

        if (command.Password is not { } password)
            return Result<RedemptionDetails>.Validation(PasswordRule.Message);

        var chosen = new ChosenLogin(loginEmail, normalizedLoginEmail, password);
        if (IsContactEmail(redeemable, normalizedLoginEmail))
            return await CreateAccountAsync(redeemable, chosen, confirmation: null, now, ct);

        if (command.ConfirmationCode is not { } confirmationCode)
            return await RequestConfirmationAsync(redeemable, chosen, ct);

        var confirmation = new EmailConfirmationAttempt
        {
            Subject = EmailConfirmationSubject.ForRedemption(redeemable.InvitationId),
            NormalizedEmail = normalizedLoginEmail,
            Code = confirmationCode,
        };

        return await CreateAccountAsync(redeemable, chosen, confirmation, now, ct);
    }

    internal async Task<Result> RecordIssuedAsync(Invitation invitation, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await VoidLiveInvitationsAsync(invitation.PersonId, invitation.IssuedAt, ct);
        _dbContext.Invitations.Add(invitation);
        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = invitation.PersonId,
                Kind = IssuedEventKindOf(invitation.Purpose),
                ActorPersonId = invitation.IssuedByPersonId,
                At = invitation.IssuedAt,
            }
        );

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (saved.IsSuccess)
            await transaction.CommitAsync(ct);

        return saved;
    }

    internal async Task<(string Code, string CodeHash)> FreshInvitationCodeAsync(
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        while (true)
        {
            var code = InvitationCode.Generate(out var codeHash);
            var isInUse = await _dbContext.Invitations.AnyAsync(
                invitation =>
                    invitation.CodeHash == codeHash
                    && invitation.RedeemedAt == null
                    && invitation.VoidedAt == null
                    && invitation.ExpiresAt > now,
                ct
            );

            if (!isInUse)
                return (code, codeHash);
        }
    }

    private async Task<Result<RedemptionDetails>> RequestConfirmationAsync(
        RedeemableInvitation redeemable,
        ChosenLogin chosen,
        CancellationToken ct
    )
    {
        if (await PasswordRefusalAsync(chosen.Password) is { } refusal)
            return refusal;

        var terms = await ClubTermsAsync(ct);
        var expiresAt = await _emailConfirmationService.IssueAsync(
            new EmailConfirmationIssue
            {
                Subject = EmailConfirmationSubject.ForRedemption(redeemable.InvitationId),
                Email = chosen.Email,
                NormalizedEmail = chosen.NormalizedEmail,
                PersonId = redeemable.PersonId,
                FirstName = redeemable.FirstName,
                ClubName = terms.ClubName,
            },
            ct
        );

        return Result<RedemptionDetails>.Success(RedemptionDetails.ConfirmationRequired(expiresAt));
    }

    private async Task<Result<RedemptionDetails>> CreateAccountAsync(
        RedeemableInvitation redeemable,
        ChosenLogin chosen,
        EmailConfirmationAttempt? confirmation,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (confirmation is not null)
        {
            var verdict = await _emailConfirmationService.ConsumeAsync(confirmation, ct);
            if (verdict != EmailConfirmationVerdict.Confirmed)
            {
                await transaction.CommitAsync(ct);
                return Result<RedemptionDetails>.Success(
                    RedemptionDetails.Refused(OutcomeOf(verdict))
                );
            }
        }

        if (!await ClaimAsync(redeemable.InvitationId, now, ct))
            return Result<RedemptionDetails>.Conflict(DeadInvitationMessage);

        var account = new Account
        {
            UserName = chosen.Email,
            Email = chosen.Email,
            EmailConfirmed = true,
            PersonId = redeemable.PersonId,
        };

        var created = await _userManager.CreateAsync(account, chosen.Password);
        if (!created.Succeeded)
            return RefusalOf(created);

        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = redeemable.PersonId,
                Kind = AccountEventKind.Redeemed,
                ActorPersonId = redeemable.PersonId,
                At = now,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation(
            "Invitation redeemed, account {AccountId} created for person {PersonId}",
            account.Id,
            redeemable.PersonId
        );

        return Result<RedemptionDetails>.Success(
            RedemptionDetails.Redeemed(await _accountService.StartSessionAsync(account, ct))
        );
    }

    private async Task<Result<RedemptionDetails>?> PasswordRefusalAsync(string password)
    {
        var candidate = new Account();
        foreach (var validator in _userManager.PasswordValidators)
        {
            var validated = await validator.ValidateAsync(_userManager, candidate, password);
            if (!validated.Succeeded)
                return Result<RedemptionDetails>.Validation(PasswordRule.Message);
        }

        return null;
    }

    private Task<bool> IsLoginEmailTakenAsync(string normalizedEmail, CancellationToken ct) =>
        _dbContext
            .Users.AsNoTracking()
            .AnyAsync(account => account.NormalizedEmail == normalizedEmail, ct);

    private string NormalizedEmailOf(string email) => _userManager.NormalizeEmail(email) ?? email;

    private bool IsContactEmail(RedeemableInvitation redeemable, string normalizedLoginEmail) =>
        string.Equals(
            NormalizedEmailOf(redeemable.ContactEmail),
            normalizedLoginEmail,
            StringComparison.Ordinal
        );

    private async Task<SubjectRow?> SubjectAsync(int personId, DateOnly today, CancellationToken ct)
    {
        var person = await _dbContext
            .People.AsNoTracking()
            .Where(row => row.Id == personId)
            .Select(row => new
            {
                row.Id,
                row.FirstName,
                row.Email,
                row.BirthDate,
            })
            .SingleOrDefaultAsync(ct);

        if (person is null)
            return null;

        var isAffiliated = await _dbContext
            .People.AsNoTracking()
            .Where(row => row.Id == personId)
            .AnyAsync(AffiliationQuery.IsAffiliatedOn(today), ct);

        var accountIsDisabled = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.PersonId == personId)
            .Select(account => (bool?)account.IsDisabled)
            .SingleOrDefaultAsync(ct);

        return new SubjectRow(
            person.Id,
            person.FirstName,
            accountIsDisabled,
            new AccountCandidate
            {
                IsAffiliated = isAffiliated,
                BirthDate = person.BirthDate,
                Email = person.Email,
            },
            today
        );
    }

    private async Task<ClubTerms> ClubTermsAsync(CancellationToken ct)
    {
        var record = await _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => new ClubTerms(row.AgeOfConsent, row.Name))
            .SingleOrDefaultAsync(ct);

        return record ?? new ClubTerms(ClubRecord.DefaultAgeOfConsent, null);
    }

    private Task<LiveInvitationRow?> LiveInvitationAsync(int personId, CancellationToken ct) =>
        _dbContext
            .Invitations.AsNoTracking()
            .Where(invitation =>
                invitation.PersonId == personId
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .Select(invitation => new LiveInvitationRow(
                invitation.Channel,
                invitation.IssuedAt,
                invitation.IssuedBy == null
                    ? null
                    : new PersonReference
                    {
                        PersonId = invitation.IssuedBy.Id,
                        FirstName = invitation.IssuedBy.FirstName,
                        LastName = invitation.IssuedBy.LastName,
                    },
                invitation.ExpiresAt
            ))
            .SingleOrDefaultAsync(ct);

    private async Task<IReadOnlyList<AccountEventDetails>> HistoryAsync(
        int personId,
        CancellationToken ct
    ) =>
        await _dbContext
            .AccountEvents.AsNoTracking()
            .Where(accountEvent => accountEvent.PersonId == personId)
            .OrderByDescending(accountEvent => accountEvent.At)
            .ThenByDescending(accountEvent => accountEvent.Id)
            .Select(accountEvent => new AccountEventDetails
            {
                Kind = accountEvent.Kind,
                At = accountEvent.At,
                Actor =
                    accountEvent.Actor == null
                        ? null
                        : new PersonReference
                        {
                            PersonId = accountEvent.Actor.Id,
                            FirstName = accountEvent.Actor.FirstName,
                            LastName = accountEvent.Actor.LastName,
                        },
            })
            .ToListAsync(ct);

    private Task VoidLiveInvitationsAsync(int personId, DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .Invitations.Where(invitation =>
                invitation.PersonId == personId
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);

    private async Task<RedeemableInvitation?> RedeemableAsync(
        InvitationCredential credential,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (MatchOf(credential) is not { } match)
            return null;

        var invitation = await _dbContext
            .Invitations.AsNoTracking()
            .Where(match)
            .Where(row =>
                row.Purpose == InvitationPurpose.Onboarding
                && row.RedeemedAt == null
                && row.VoidedAt == null
                && row.ExpiresAt > now
            )
            .Select(row => new { row.Id, row.PersonId })
            .SingleOrDefaultAsync(ct);

        if (invitation is null)
            return null;

        var subject = await SubjectAsync(invitation.PersonId, ClubClock.DayOf(now), ct);
        if (
            subject is null
            || RefusalOf(subject, await ClubTermsAsync(ct), admitsUnknownBirthDate: true)
                is not null
        )
            return null;

        return new RedeemableInvitation(
            invitation.Id,
            subject.PersonId,
            subject.FirstName,
            subject.Candidate.Email!
        );
    }

    private async Task<bool> ClaimAsync(int invitationId, DateTimeOffset now, CancellationToken ct)
    {
        var claimed = await _dbContext
            .Invitations.Where(row =>
                row.Id == invitationId
                && row.RedeemedAt == null
                && row.VoidedAt == null
                && row.ExpiresAt > now
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.RedeemedAt, now), ct);

        return claimed == 1;
    }

    private InvitationMailContent ToMailContent(
        SubjectRow subject,
        ClubTerms terms,
        string token,
        DateTimeOffset expiresAt
    ) =>
        new()
        {
            PersonId = subject.PersonId,
            To = subject.Candidate.Email!,
            FirstName = subject.FirstName,
            ClubName = terms.ClubName,
            Link = InvitationMail.LinkOf(_clubAppOptions.BaseUrl, token),
            ExpiresAt = expiresAt,
        };

    [Pure]
    internal static Expression<Func<Invitation, bool>>? MatchOf(InvitationCredential credential)
    {
        if (credential.Token is { } token)
            return OpaqueTokenSecret.HashOf(token) is { } tokenHash
                ? row => row.TokenHash == tokenHash
                : null;

        if (credential.Code is { } code)
            return InvitationCode.HashOf(code) is { } codeHash
                ? row => row.CodeHash == codeHash && row.Channel == InvitationChannel.InPerson
                : null;

        return null;
    }

    [Pure]
    private static string? RefusalOf(
        SubjectRow subject,
        ClubTerms terms,
        bool admitsUnknownBirthDate
    ) =>
        subject.AccountIsDisabled is not null
            ? $"{subject.FirstName} hat bereits einen Zugang."
            : (
                admitsUnknownBirthDate && subject.Candidate.BirthDate is null
                    ? AccountEligibility.ReasonAgainstWithVouchedAge(subject.Candidate)
                    : AccountEligibility.ReasonAgainst(
                        subject.Candidate,
                        subject.Today,
                        terms.AgeOfConsent
                    )
            ) switch
            {
                null => null,
                { } reason => RefusalMessage(reason, subject.FirstName, terms.AgeOfConsent),
            };

    [Pure]
    private static string RefusalMessage(
        AccountIneligibilityReason reason,
        string firstName,
        int ageOfConsent
    ) =>
        reason switch
        {
            AccountIneligibilityReason.NotAffiliated => $"{firstName} ist nicht im Verein aktiv.",
            AccountIneligibilityReason.NoBirthDate =>
                $"Für {firstName} ist kein Geburtsdatum hinterlegt.",
            AccountIneligibilityReason.UnderAge => $"{firstName} ist noch nicht {ageOfConsent}.",
            AccountIneligibilityReason.NoEmail =>
                $"Für {firstName} ist keine E-Mail-Adresse hinterlegt.",
            _ => throw new ArgumentOutOfRangeException(nameof(reason), reason, null),
        };

    [Pure]
    private static RedemptionOutcome OutcomeOf(EmailConfirmationVerdict verdict) =>
        verdict switch
        {
            EmailConfirmationVerdict.Wrong => RedemptionOutcome.ConfirmationCodeWrong,
            EmailConfirmationVerdict.Dead => RedemptionOutcome.ConfirmationCodeDead,
            _ => throw new ArgumentOutOfRangeException(nameof(verdict), verdict, null),
        };

    [Pure]
    private static AccountEventKind IssuedEventKindOf(InvitationPurpose purpose) =>
        purpose == InvitationPurpose.Recovery
            ? AccountEventKind.RecoveryIssued
            : AccountEventKind.Invited;

    [Pure]
    private static Result<RedemptionDetails> RefusalOf(IdentityResult created)
    {
        if (created.Errors.Any(error => TakenLoginErrorCodes.Contains(error.Code)))
            return Result<RedemptionDetails>.Success(
                RedemptionDetails.Refused(RedemptionOutcome.LoginEmailTaken)
            );

        if (
            created.Errors.All(error =>
                error.Code.StartsWith(PasswordErrorPrefix, StringComparison.Ordinal)
            )
        )
            return Result<RedemptionDetails>.Validation(PasswordRule.Message);

        throw new InvalidOperationException(
            "The account could not be created: "
                + string.Join(", ", created.Errors.Select(error => error.Code))
        );
    }

    [Pure]
    private static AccountAccessDetails ToDetails(
        SubjectRow subject,
        ClubTerms terms,
        LiveInvitationRow? invitation,
        IReadOnlyList<AccountEventDetails> history,
        DateTimeOffset now
    )
    {
        var hasAccount = subject.AccountIsDisabled is not null;
        var liveInvitation = hasAccount || invitation is null ? null : ToDetails(invitation, now);

        return new AccountAccessDetails
        {
            State = AccountEligibility.StateOf(
                subject.AccountIsDisabled,
                liveInvitation is { IsExpired: false }
            ),
            Reason = hasAccount
                ? null
                : AccountEligibility.ReasonAgainst(
                    subject.Candidate,
                    subject.Today,
                    terms.AgeOfConsent
                ),
            Invitation = liveInvitation,
            History = history,
        };
    }

    [Pure]
    private static LiveInvitationDetails ToDetails(LiveInvitationRow row, DateTimeOffset now) =>
        new()
        {
            Channel = row.Channel,
            IssuedAt = row.IssuedAt,
            IssuedBy = row.IssuedBy,
            ExpiresAt = row.ExpiresAt,
            IsExpired = Invitation.IsExpiredAt(row.ExpiresAt, now),
        };

    private sealed record SubjectRow(
        int PersonId,
        string FirstName,
        bool? AccountIsDisabled,
        AccountCandidate Candidate,
        DateOnly Today
    );

    private sealed record ClubTerms(int AgeOfConsent, string? ClubName);

    private sealed record LiveInvitationRow(
        InvitationChannel Channel,
        DateTimeOffset IssuedAt,
        PersonReference? IssuedBy,
        DateTimeOffset ExpiresAt
    );

    private sealed record RedeemableInvitation(
        int InvitationId,
        int PersonId,
        string FirstName,
        string ContactEmail
    );

    private sealed record ChosenLogin(string Email, string NormalizedEmail, string Password);
}
