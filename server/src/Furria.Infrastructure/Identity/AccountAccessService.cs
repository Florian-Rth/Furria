using System.Diagnostics.Contracts;
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
    private const string TakenLoginEmailMessage =
        "Diese E-Mail-Adresse gehört schon zu einem anderen Zugang.";
    private const string PasswordRuleMessage =
        "Das Passwort braucht mindestens 12 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer und ein Sonderzeichen.";
    private const string InvitationLinkPath = "/invitation#token=";
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
    private readonly ClubAppOptions _clubAppOptions;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountAccessService> _logger;

    public AccountAccessService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        AccountService accountService,
        MailQueue mailQueue,
        IOptions<ClubAppOptions> clubAppOptions,
        TimeProvider timeProvider,
        ILogger<AccountAccessService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _accountService = accountService;
        _mailQueue = mailQueue;
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
        int issuerPersonId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var subject = await SubjectAsync(personId, ClubClock.DayOf(now), ct);
        if (subject is null)
            return Result<IssuedInvitationDetails>.NotFound(UnknownPersonMessage);

        var terms = await ClubTermsAsync(ct);
        if (RefusalOf(subject, terms) is { } refusal)
            return Result<IssuedInvitationDetails>.Conflict(refusal);

        var token = OpaqueTokenSecret.Generate(out var tokenHash);
        var expiresAt = now + Invitation.MailLifetime;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await VoidLiveInvitationsAsync(personId, now, ct);
        _dbContext.Invitations.Add(
            new Invitation
            {
                PersonId = personId,
                Purpose = InvitationPurpose.Onboarding,
                Channel = InvitationChannel.Mail,
                TokenHash = tokenHash,
                IssuedByPersonId = issuerPersonId,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            }
        );
        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = personId,
                Kind = AccountEventKind.Invited,
                ActorPersonId = issuerPersonId,
                At = now,
            }
        );

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<IssuedInvitationDetails>.Carrying(saved);

        await transaction.CommitAsync(ct);

        _mailQueue.Enqueue(InvitationMail.Compose(ToMailContent(subject, terms, token, expiresAt)));
        _logger.LogInformation("Mail invitation issued for person {PersonId}", personId);

        return Result<IssuedInvitationDetails>.Success(
            new IssuedInvitationDetails { ExpiresAt = expiresAt }
        );
    }

    public async Task<InvitationLookupDetails?> LookUpAsync(string token, CancellationToken ct)
    {
        var redeemable = await RedeemableAsync(token, _timeProvider.GetUtcNow(), ct);

        return redeemable is null
            ? null
            : new InvitationLookupDetails
            {
                FirstName = redeemable.FirstName,
                LoginEmail = redeemable.LoginEmail,
            };
    }

    public async Task<Result<SessionTokensDetails>> RedeemAsync(
        RedeemInvitationCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var redeemable = await RedeemableAsync(command.Token, now, ct);
        if (redeemable is null)
            return Result<SessionTokensDetails>.Conflict(DeadInvitationMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await ClaimAsync(redeemable.InvitationId, now, ct))
            return Result<SessionTokensDetails>.Conflict(DeadInvitationMessage);

        var account = new Account
        {
            UserName = redeemable.LoginEmail,
            Email = redeemable.LoginEmail,
            EmailConfirmed = true,
            PersonId = redeemable.PersonId,
        };

        var created = await _userManager.CreateAsync(account, command.Password);
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

        return Result<SessionTokensDetails>.Success(
            await _accountService.StartSessionAsync(account, ct)
        );
    }

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
        string token,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (OpaqueTokenSecret.HashOf(token) is not { } tokenHash)
            return null;

        var invitation = await _dbContext
            .Invitations.AsNoTracking()
            .Where(row =>
                row.TokenHash == tokenHash
                && row.Purpose == InvitationPurpose.Onboarding
                && row.RedeemedAt == null
                && row.VoidedAt == null
                && row.ExpiresAt > now
            )
            .Select(row => new { row.Id, row.PersonId })
            .SingleOrDefaultAsync(ct);

        if (invitation is null)
            return null;

        var subject = await SubjectAsync(invitation.PersonId, ClubClock.DayOf(now), ct);
        if (subject is null || RefusalOf(subject, await ClubTermsAsync(ct)) is not null)
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
            Link = $"{_clubAppOptions.BaseUrl.TrimEnd('/')}{InvitationLinkPath}{token}",
            ExpiresAt = expiresAt,
        };

    [Pure]
    private static string? RefusalOf(SubjectRow subject, ClubTerms terms) =>
        subject.AccountIsDisabled is not null
            ? $"{subject.FirstName} hat bereits einen Zugang."
            : AccountEligibility.ReasonAgainst(
                subject.Candidate,
                subject.Today,
                terms.AgeOfConsent
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
    private static Result<SessionTokensDetails> RefusalOf(IdentityResult created)
    {
        if (created.Errors.Any(error => TakenLoginErrorCodes.Contains(error.Code)))
            return Result<SessionTokensDetails>.Conflict(TakenLoginEmailMessage);

        if (
            created.Errors.All(error =>
                error.Code.StartsWith(PasswordErrorPrefix, StringComparison.Ordinal)
            )
        )
            return Result<SessionTokensDetails>.Validation(PasswordRuleMessage);

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
        string LoginEmail
    );
}
