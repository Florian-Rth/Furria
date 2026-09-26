using System.Diagnostics.Contracts;
using System.Globalization;
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

public sealed class AccountSecurityService
{
    private const string MissingAccountMessage = "Dieser Zugang besteht nicht mehr.";
    private const string DisabledAccountMessage = "Dieser Zugang ist gesperrt.";
    private const string SameLoginEmailMessage =
        "Mit dieser E-Mail-Adresse meldest du dich schon an.";
    private const string TakenLoginEmailMessage =
        "Diese E-Mail-Adresse gehört schon zu einem Zugang. Wähle eine andere.";
    private const string WrongConfirmationCodeMessage =
        "Der Code stimmt nicht. Prüf die Mail und versuch es noch einmal.";
    private const string DeadConfirmationCodeMessage =
        "Dieser Code gilt nicht mehr. Lass dir einen neuen schicken.";
    private const string WrongPasswordMessage = "Das Passwort stimmt nicht.";
    private const string LockedOutMessage =
        "Zu viele Fehlversuche. Versuch es in 15 Minuten noch einmal.";
    private const string PasswordRuleMessage =
        "Das Passwort braucht mindestens 12 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer und ein Sonderzeichen.";
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
    private readonly SignInManager<Account> _signInManager;
    private readonly AccountService _accountService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly EmailConfirmationService _emailConfirmationService;
    private readonly CredentialChangeNotifier _credentialChangeNotifier;
    private readonly PersonService _personService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AccountSecurityService> _logger;

    public AccountSecurityService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        AccountService accountService,
        RefreshTokenService refreshTokenService,
        EmailConfirmationService emailConfirmationService,
        CredentialChangeNotifier credentialChangeNotifier,
        PersonService personService,
        TimeProvider timeProvider,
        ILogger<AccountSecurityService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _accountService = accountService;
        _refreshTokenService = refreshTokenService;
        _emailConfirmationService = emailConfirmationService;
        _credentialChangeNotifier = credentialChangeNotifier;
        _personService = personService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result<DateTimeOffset>> RequestLoginEmailChangeAsync(
        ChangeLoginEmailCommand command,
        CancellationToken ct
    )
    {
        var holder = await HolderAsync(command.AccountId, ct);
        if (holder is null)
            return Result<DateTimeOffset>.NotFound(MissingAccountMessage);

        if (holder.IsDisabled)
            return Result<DateTimeOffset>.Forbidden(DisabledAccountMessage);

        var loginEmail = command.LoginEmail.Trim();
        var normalizedLoginEmail = NormalizedEmailOf(loginEmail);
        if (string.Equals(holder.NormalizedEmail, normalizedLoginEmail, StringComparison.Ordinal))
            return Result<DateTimeOffset>.Validation(SameLoginEmailMessage);

        if (await IsTakenByAnotherAsync(normalizedLoginEmail, command.AccountId, ct))
            return Result<DateTimeOffset>.Conflict(TakenLoginEmailMessage);

        var expiresAt = await _emailConfirmationService.IssueAsync(
            new EmailConfirmationIssue
            {
                Subject = EmailConfirmationSubject.ForLoginEmailChange(command.AccountId),
                Email = loginEmail,
                NormalizedEmail = normalizedLoginEmail,
                PersonId = holder.PersonId,
                FirstName = holder.FirstName,
                ClubName = await ClubNameAsync(ct),
                UpdatesContactEmail = command.UpdateContactEmail,
            },
            ct
        );
        _logger.LogInformation(
            "Login email change requested for account {AccountId}",
            command.AccountId
        );

        return Result<DateTimeOffset>.Success(expiresAt);
    }

    public async Task<Result> ConfirmLoginEmailChangeAsync(
        int accountId,
        string code,
        CancellationToken ct
    )
    {
        var account = await FindAccountAsync(accountId);
        if (account is not { IsDisabled: false })
            return RefusalOf(account);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var confirmed = await _emailConfirmationService.ConfirmPendingAsync(
            EmailConfirmationSubject.ForLoginEmailChange(accountId),
            code,
            ct
        );
        if (confirmed is not { Verdict: EmailConfirmationVerdict.Confirmed, Email: { } email })
        {
            await transaction.CommitAsync(ct);
            return Result.Validation(ConfirmationRefusalMessage(confirmed.Verdict));
        }

        var previousEmail = account.Email;
        var changed = await ChangeLoginAsync(account, email);
        if (!changed.IsSuccess)
        {
            await transaction.RollbackAsync(ct);
            return changed;
        }

        RecordEvent(account.PersonId, AccountEventKind.LoginEmailChanged);
        await _dbContext.SaveChangesAsync(ct);

        if (confirmed.UpdatesContactEmail)
        {
            var followed = await _personService.UpdateOwnContactEmailAsync(
                account.PersonId,
                email,
                ct
            );
            if (!followed.IsSuccess)
            {
                await transaction.RollbackAsync(ct);
                return followed;
            }
        }

        await transaction.CommitAsync(ct);
        _logger.LogInformation("Login email changed for account {AccountId}", accountId);

        await _credentialChangeNotifier.NotifyAsync(
            accountId,
            CredentialChange.LoginEmailChanged,
            previousEmail,
            ct
        );

        return Result.Success();
    }

    public async Task<Result<SessionTokensDetails>> ChangePasswordAsync(
        ChangePasswordCommand command,
        CancellationToken ct
    )
    {
        var account = await FindAccountAsync(command.AccountId);
        if (account is not { IsDisabled: false })
            return Result<SessionTokensDetails>.Carrying(RefusalOf(account));

        var proof = new ReauthenticationProof { Password = command.CurrentPassword };
        var verdict = await ReauthenticateAsync(account, proof);
        if (verdict != ReauthenticationVerdict.Proven)
            return Result<SessionTokensDetails>.Unauthorized(ReauthenticationMessage(verdict));

        var changed = await _userManager.ChangePasswordAsync(
            account,
            command.CurrentPassword,
            command.NewPassword
        );
        if (!changed.Succeeded)
            return Result<SessionTokensDetails>.Carrying(PasswordRefusalOf(changed));

        await _refreshTokenService.RevokeAllAsync(account.Id, ct);
        var session = await _accountService.StartSessionAsync(account, ct);
        _logger.LogInformation(
            "Password changed for account {AccountId}, every earlier session ended",
            account.Id
        );

        await _credentialChangeNotifier.NotifyAsync(
            account.Id,
            CredentialChange.PasswordChanged,
            toAddress: null,
            ct
        );

        return Result<SessionTokensDetails>.Success(session);
    }

    public async Task LogOutEverywhereAsync(int accountId, CancellationToken ct)
    {
        await _refreshTokenService.RevokeAllAsync(accountId, ct);
        _logger.LogInformation("Account {AccountId} signed out everywhere", accountId);
    }

    public async Task<Result> DeleteAccountAsync(DeleteAccountCommand command, CancellationToken ct)
    {
        var account = await FindAccountAsync(command.AccountId);
        if (account is not { IsDisabled: false })
            return RefusalOf(account);

        var verdict = await ReauthenticateAsync(account, command.Proof);
        if (verdict != ReauthenticationVerdict.Proven)
            return Result.Unauthorized(ReauthenticationMessage(verdict));

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await VoidLiveInvitationsAsync(account.PersonId, ct);
        RecordEvent(account.PersonId, AccountEventKind.Deleted);
        await _dbContext.SaveChangesAsync(ct);

        var deleted = await _userManager.DeleteAsync(account);
        if (!deleted.Succeeded)
            throw new InvalidOperationException(
                "The account could not be deleted: "
                    + string.Join(", ", deleted.Errors.Select(error => error.Code))
            );

        await transaction.CommitAsync(ct);
        _logger.LogInformation(
            "Account {AccountId} of person {PersonId} deleted",
            account.Id,
            account.PersonId
        );

        return Result.Success();
    }

    private async Task<ReauthenticationVerdict> ReauthenticateAsync(
        Account account,
        ReauthenticationProof proof
    )
    {
        var wasLockedOut = await _userManager.IsLockedOutAsync(account);
        var signIn = await _signInManager.CheckPasswordSignInAsync(
            account,
            proof.Password,
            lockoutOnFailure: true
        );

        if (signIn.Succeeded)
            return ReauthenticationVerdict.Proven;

        if (signIn.IsLockedOut && !wasLockedOut)
            _logger.LogWarning(
                "Account {AccountId} locked out until {LockoutEnd}",
                account.Id,
                account.LockoutEnd
            );

        var verdict = signIn.IsLockedOut
            ? ReauthenticationVerdict.LockedOut
            : ReauthenticationVerdict.Wrong;
        _logger.LogInformation(
            "Re-authentication failed for account {AccountId}: {ReauthenticationVerdict}",
            account.Id,
            verdict
        );

        return verdict;
    }

    private async Task<Result> ChangeLoginAsync(Account account, string email)
    {
        account.Email = email;
        account.UserName = email;
        account.EmailConfirmed = true;

        var updated = await _userManager.UpdateAsync(account);
        if (updated.Succeeded)
            return Result.Success();

        if (updated.Errors.Any(error => TakenLoginErrorCodes.Contains(error.Code)))
            return Result.Conflict(TakenLoginEmailMessage);

        throw new InvalidOperationException(
            "The login email could not be changed: "
                + string.Join(", ", updated.Errors.Select(error => error.Code))
        );
    }

    private void RecordEvent(int personId, AccountEventKind kind) =>
        _dbContext.AccountEvents.Add(
            new AccountEvent
            {
                PersonId = personId,
                Kind = kind,
                ActorPersonId = personId,
                At = _timeProvider.GetUtcNow(),
            }
        );

    private Task VoidLiveInvitationsAsync(int personId, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        return _dbContext
            .Invitations.Where(invitation =>
                invitation.PersonId == personId
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);
    }

    private Task<Account?> FindAccountAsync(int accountId) =>
        _userManager.FindByIdAsync(accountId.ToString(CultureInfo.InvariantCulture));

    private Task<AccountHolder?> HolderAsync(int accountId, CancellationToken ct) =>
        _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId)
            .Select(account => new AccountHolder(
                account.PersonId,
                account.Person!.FirstName,
                account.NormalizedEmail,
                account.IsDisabled
            ))
            .SingleOrDefaultAsync(ct);

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

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => row.Name)
            .SingleOrDefaultAsync(ct);

    private string NormalizedEmailOf(string email) => _userManager.NormalizeEmail(email) ?? email;

    [Pure]
    private static Result RefusalOf(Account? account) =>
        account is null
            ? Result.NotFound(MissingAccountMessage)
            : Result.Forbidden(DisabledAccountMessage);

    [Pure]
    private static Result PasswordRefusalOf(IdentityResult changed)
    {
        if (
            changed.Errors.All(error =>
                error.Code.StartsWith(PasswordErrorPrefix, StringComparison.Ordinal)
            )
        )
            return Result.Validation(PasswordRuleMessage);

        throw new InvalidOperationException(
            "The password could not be changed: "
                + string.Join(", ", changed.Errors.Select(error => error.Code))
        );
    }

    [Pure]
    private static string ReauthenticationMessage(ReauthenticationVerdict verdict) =>
        verdict == ReauthenticationVerdict.LockedOut ? LockedOutMessage : WrongPasswordMessage;

    [Pure]
    private static string ConfirmationRefusalMessage(EmailConfirmationVerdict verdict) =>
        verdict == EmailConfirmationVerdict.Wrong
            ? WrongConfirmationCodeMessage
            : DeadConfirmationCodeMessage;

    private sealed record AccountHolder(
        int PersonId,
        string FirstName,
        string? NormalizedEmail,
        bool IsDisabled
    );
}
