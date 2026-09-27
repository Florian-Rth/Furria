using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class AccessRecoveryService
{
    private const string DeadRecoveryMessage = "Diese Wiederherstellung gilt nicht mehr.";

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly AccountService _accountService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly EmailConfirmationService _emailConfirmationService;
    private readonly CredentialChangeNotifier _credentialChangeNotifier;
    private readonly PersonService _personService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccessRecoveryService> _logger;

    public AccessRecoveryService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        AccountService accountService,
        RefreshTokenService refreshTokenService,
        EmailConfirmationService emailConfirmationService,
        CredentialChangeNotifier credentialChangeNotifier,
        PersonService personService,
        TimeProvider timeProvider,
        ILogger<AccessRecoveryService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _accountService = accountService;
        _refreshTokenService = refreshTokenService;
        _emailConfirmationService = emailConfirmationService;
        _credentialChangeNotifier = credentialChangeNotifier;
        _personService = personService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<InvitationLookupDetails?> LookUpAsync(
        InvitationCredential credential,
        CancellationToken ct
    )
    {
        var recoverable = await RecoverableAsync(credential, _timeProvider.GetUtcNow(), ct);

        return recoverable is null
            ? null
            : new InvitationLookupDetails
            {
                FirstName = recoverable.FirstName,
                LoginEmail = recoverable.LoginEmail,
                ContactEmailTaken = false,
                Purpose = InvitationPurpose.Recovery,
                ClaimableLoginEmail = null,
            };
    }

    public async Task<bool> IsRecoveryAsync(InvitationCredential credential, CancellationToken ct)
    {
        if (AccountAccessService.MatchOf(credential) is not { } match)
            return false;

        return await _dbContext
            .Invitations.AsNoTracking()
            .Where(match)
            .AnyAsync(row => row.Purpose == InvitationPurpose.Recovery, ct);
    }

    public Task<bool> HasOpenRecoveryAsync(int personId, CancellationToken ct) =>
        _dbContext
            .Invitations.AsNoTracking()
            .AnyAsync(
                invitation =>
                    invitation.PersonId == personId
                    && invitation.Purpose == InvitationPurpose.Recovery
                    && invitation.RedeemedAt == null
                    && invitation.VoidedAt == null,
                ct
            );

    public async Task<Result<RedemptionDetails>> RecoverAsync(
        RedeemInvitationCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var recoverable = await RecoverableAsync(command.Credential, now, ct);
        if (recoverable is null)
            return Result<RedemptionDetails>.Conflict(DeadRecoveryMessage);

        if (command.Password is not { } password)
            return Result<RedemptionDetails>.Validation(PasswordRule.Message);

        var loginEmail = command.LoginEmail?.Trim() ?? recoverable.LoginEmail;
        var chosen = new ChosenLogin(loginEmail, NormalizedEmailOf(loginEmail), password);
        var keepsLoginEmail = string.Equals(
            chosen.NormalizedEmail,
            recoverable.NormalizedLoginEmail,
            StringComparison.Ordinal
        );

        if (
            !keepsLoginEmail
            && await IsTakenByAnotherAsync(chosen.NormalizedEmail, recoverable.AccountId, ct)
        )
            return Result<RedemptionDetails>.Success(
                RedemptionDetails.Refused(RedemptionOutcome.LoginEmailTaken)
            );

        if (await PasswordRefusalAsync(chosen.Password) is { } refusal)
            return refusal;

        if (keepsLoginEmail)
            return await ApplyAsync(recoverable, chosen, confirmation: null, now, ct);

        if (command.ConfirmationCode is not { } confirmationCode)
            return await RequestConfirmationAsync(
                recoverable,
                chosen,
                command.UpdateContactEmail,
                ct
            );

        var confirmation = new EmailConfirmationAttempt
        {
            Subject = EmailConfirmationSubject.ForRedemption(recoverable.InvitationId),
            NormalizedEmail = chosen.NormalizedEmail,
            Code = confirmationCode,
        };

        return await ApplyAsync(recoverable, chosen, confirmation, now, ct);
    }

    private async Task<Result<RedemptionDetails>> RequestConfirmationAsync(
        RecoverableAccess recoverable,
        ChosenLogin chosen,
        bool updatesContactEmail,
        CancellationToken ct
    )
    {
        var expiresAt = await _emailConfirmationService.IssueAsync(
            new EmailConfirmationIssue
            {
                Subject = EmailConfirmationSubject.ForRedemption(recoverable.InvitationId),
                Email = chosen.Email,
                NormalizedEmail = chosen.NormalizedEmail,
                PersonId = recoverable.PersonId,
                FirstName = recoverable.FirstName,
                ClubName = await ClubNameAsync(ct),
                UpdatesContactEmail = updatesContactEmail,
            },
            ct
        );

        return Result<RedemptionDetails>.Success(RedemptionDetails.ConfirmationRequired(expiresAt));
    }

    private async Task<Result<RedemptionDetails>> ApplyAsync(
        RecoverableAccess recoverable,
        ChosenLogin chosen,
        EmailConfirmationAttempt? confirmation,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var confirmed = confirmation is null
            ? null
            : await _emailConfirmationService.ConfirmAsync(confirmation, ct);
        if (confirmed is { Verdict: not EmailConfirmationVerdict.Confirmed })
        {
            await transaction.CommitAsync(ct);
            return Result<RedemptionDetails>.Success(
                RedemptionDetails.Refused(OutcomeOf(confirmed.Verdict))
            );
        }

        if (!await ClaimAsync(recoverable.InvitationId, now, ct))
            return Result<RedemptionDetails>.Conflict(DeadRecoveryMessage);

        var account = await _dbContext.Users.SingleAsync(
            row => row.Id == recoverable.AccountId,
            ct
        );
        SetCredentials(account, chosen);
        var updated = await _userManager.UpdateSecurityStampAsync(account);
        if (!updated.Succeeded)
            return RefusalOf(updated);

        var changesLoginEmail = confirmed is not null;
        _dbContext.AccountEvents.AddRange(EventsOf(recoverable.PersonId, changesLoginEmail, now));
        await _dbContext.SaveChangesAsync(ct);
        if (confirmed is { UpdatesContactEmail: true })
        {
            var followed = await _personService.UpdateOwnContactEmailAsync(
                recoverable.PersonId,
                chosen.Email,
                ct
            );
            if (!followed.IsSuccess)
            {
                await transaction.RollbackAsync(ct);
                return Result<RedemptionDetails>.Carrying(followed);
            }
        }

        await _refreshTokenService.RevokeAllAsync(account.Id, ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation(
            "Access recovered for account {AccountId} of person {PersonId}",
            account.Id,
            recoverable.PersonId
        );
        await _credentialChangeNotifier.NotifyAsync(
            account.Id,
            CredentialChange.AccessRecovered,
            recoverable.LoginEmail,
            ct
        );

        return Result<RedemptionDetails>.Success(
            RedemptionDetails.Redeemed(await _accountService.StartSessionAsync(account, ct))
        );
    }

    private void SetCredentials(Account account, ChosenLogin chosen)
    {
        account.PasswordHash = _userManager.PasswordHasher.HashPassword(account, chosen.Password);
        account.Email = chosen.Email;
        account.UserName = chosen.Email;
        account.EmailConfirmed = true;
        account.LockoutEnd = null;
        account.AccessFailedCount = 0;
    }

    private async Task<RecoverableAccess?> RecoverableAsync(
        InvitationCredential credential,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (AccountAccessService.MatchOf(credential) is not { } match)
            return null;

        var row = await _dbContext
            .Invitations.AsNoTracking()
            .Where(match)
            .Where(invitation =>
                invitation.Purpose == InvitationPurpose.Recovery
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
                && invitation.ExpiresAt > now
            )
            .Select(invitation => new
            {
                invitation.Id,
                invitation.PersonId,
                invitation.Person!.FirstName,
                Account = _dbContext
                    .Users.Where(account => account.PersonId == invitation.PersonId)
                    .Select(account => new
                    {
                        account.Id,
                        account.Email,
                        account.NormalizedEmail,
                        account.IsDisabled,
                    })
                    .FirstOrDefault(),
            })
            .SingleOrDefaultAsync(ct);

        if (row?.Account is not { IsDisabled: false, Email: { } email } account)
            return null;

        return new RecoverableAccess(
            row.Id,
            row.PersonId,
            row.FirstName,
            account.Id,
            email,
            account.NormalizedEmail ?? NormalizedEmailOf(email)
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

    private Task<bool> IsTakenByAnotherAsync(
        string normalizedEmail,
        int accountId,
        CancellationToken ct
    ) =>
        _dbContext
            .Users.AsNoTracking()
            .AnyAsync(
                account => account.NormalizedEmail == normalizedEmail && account.Id != accountId,
                ct
            );

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

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => row.Name)
            .SingleOrDefaultAsync(ct);

    private string NormalizedEmailOf(string email) => _userManager.NormalizeEmail(email) ?? email;

    [Pure]
    private static IEnumerable<AccountEvent> EventsOf(
        int personId,
        bool changesLoginEmail,
        DateTimeOffset now
    )
    {
        yield return new AccountEvent
        {
            PersonId = personId,
            Kind = AccountEventKind.Recovered,
            ActorPersonId = personId,
            At = now,
        };

        if (changesLoginEmail)
            yield return new AccountEvent
            {
                PersonId = personId,
                Kind = AccountEventKind.LoginEmailChanged,
                ActorPersonId = personId,
                At = now,
            };
    }

    [Pure]
    private static RedemptionOutcome OutcomeOf(EmailConfirmationVerdict verdict) =>
        verdict switch
        {
            EmailConfirmationVerdict.Wrong => RedemptionOutcome.ConfirmationCodeWrong,
            EmailConfirmationVerdict.Dead => RedemptionOutcome.ConfirmationCodeDead,
            _ => throw new ArgumentOutOfRangeException(nameof(verdict), verdict, null),
        };

    [Pure]
    private static Result<RedemptionDetails> RefusalOf(IdentityResult updated)
    {
        if (
            updated.Errors.Any(error =>
                error.Code
                    is nameof(IdentityErrorDescriber.DuplicateEmail)
                        or nameof(IdentityErrorDescriber.DuplicateUserName)
            )
        )
            return Result<RedemptionDetails>.Success(
                RedemptionDetails.Refused(RedemptionOutcome.LoginEmailTaken)
            );

        throw new InvalidOperationException(
            "The recovered account could not be saved: "
                + string.Join(", ", updated.Errors.Select(error => error.Code))
        );
    }

    private sealed record RecoverableAccess(
        int InvitationId,
        int PersonId,
        string FirstName,
        int AccountId,
        string LoginEmail,
        string NormalizedLoginEmail
    );

    private sealed record ChosenLogin(string Email, string NormalizedEmail, string Password);
}
