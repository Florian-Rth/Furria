using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class PasswordResetService
{
    public const string DeadLinkMessage =
        "Dieser Link gilt nicht mehr. Fordere über „Passwort vergessen“ einen neuen an.";
    public const string PasswordRuleMessage =
        "Das Passwort braucht mindestens 12 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer und ein Sonderzeichen.";

    public static readonly TimeSpan LinkLifetime = TimeSpan.FromHours(1);

    private const string PasswordErrorPrefix = "Password";

    private readonly AppDbContext _dbContext;
    private readonly UserManager<Account> _userManager;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly CredentialChangeNotifier _credentialChangeNotifier;
    private readonly ClubRecordService _clubRecordService;
    private readonly MailQueue _mailQueue;
    private readonly PasswordResetMailThrottle _mailThrottle;
    private readonly ClubAppOptions _clubAppOptions;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        RefreshTokenService refreshTokenService,
        CredentialChangeNotifier credentialChangeNotifier,
        ClubRecordService clubRecordService,
        MailQueue mailQueue,
        PasswordResetMailThrottle mailThrottle,
        IOptions<ClubAppOptions> clubAppOptions,
        ILogger<PasswordResetService> logger
    )
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _refreshTokenService = refreshTokenService;
        _credentialChangeNotifier = credentialChangeNotifier;
        _clubRecordService = clubRecordService;
        _mailQueue = mailQueue;
        _mailThrottle = mailThrottle;
        _clubAppOptions = clubAppOptions.Value;
        _logger = logger;
    }

    public async Task AnswerRequestAsync(string loginEmail, CancellationToken ct)
    {
        if (!_mailThrottle.TryClaim(loginEmail))
            return;

        var account = await _userManager.FindByEmailAsync(loginEmail.Trim());
        if (account is null || account.IsDisabled || account.Email is not { } to)
            return;

        var token = await _userManager.GeneratePasswordResetTokenAsync(account);
        _mailQueue.Enqueue(
            PasswordResetMail.Compose(
                new PasswordResetMailContent
                {
                    PersonId = account.PersonId,
                    To = to,
                    FirstName = await FirstNameAsync(account.PersonId, ct),
                    ClubName = (await _clubRecordService.GetAsync(ct)).Name,
                    Link = PasswordResetLink.LinkOf(_clubAppOptions.BaseUrl, account.Id, token),
                }
            )
        );
        _logger.LogInformation("Password reset link queued for account {AccountId}", account.Id);
    }

    public async Task<Result> ResetAsync(ResetPasswordCommand command, CancellationToken ct)
    {
        if (PasswordResetLink.Read(command.Reset) is not { } credential)
            return Result.Conflict(DeadLinkMessage);

        var account = await _userManager.FindByIdAsync(
            credential.AccountId.ToString(CultureInfo.InvariantCulture)
        );
        if (account is null || account.IsDisabled)
            return Result.Conflict(DeadLinkMessage);

        var reset = await _userManager.ResetPasswordAsync(
            account,
            credential.Token,
            command.Password
        );
        if (!reset.Succeeded)
            return RefusalOf(reset);

        await _userManager.ResetAccessFailedCountAsync(account);
        await _userManager.SetLockoutEndDateAsync(account, null);
        await _refreshTokenService.RevokeAllAsync(account.Id, ct);
        await _credentialChangeNotifier.NotifyAsync(
            account.Id,
            CredentialChange.PasswordReset,
            null,
            ct
        );
        _logger.LogInformation(
            "Password reset for account {AccountId}, every session ended",
            account.Id
        );

        return Result.Success();
    }

    private Task<string> FirstNameAsync(int personId, CancellationToken ct) =>
        _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Select(person => person.FirstName)
            .SingleAsync(ct);

    [Pure]
    private static Result RefusalOf(IdentityResult reset) =>
        reset.Errors.All(error =>
            error.Code.StartsWith(PasswordErrorPrefix, StringComparison.Ordinal)
        )
            ? Result.Validation(PasswordRuleMessage)
            : Result.Conflict(DeadLinkMessage);
}
