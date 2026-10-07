using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class ReauthenticationService
{
    private const string WrongPasswordMessage = "Das Passwort stimmt nicht.";
    private const string RejectedPasskeyMessage =
        "Der Passkey konnte nicht bestätigt werden. Versuch es noch einmal.";
    private const string LockedOutMessage =
        "Zu viele Fehlversuche. Versuch es in 15 Minuten noch einmal.";

    private readonly UserManager<Account> _userManager;
    private readonly SignInManager<Account> _signInManager;
    private readonly PasskeyService _passkeyService;
    private readonly ILogger<ReauthenticationService> _logger;

    public ReauthenticationService(
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        PasskeyService passkeyService,
        ILogger<ReauthenticationService> logger
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _passkeyService = passkeyService;
        _logger = logger;
    }

    public async Task<Result> ProveAsync(
        Account account,
        ReauthenticationProof proof,
        CancellationToken ct
    )
    {
        var verdict = await VerdictOfAsync(account, proof, ct);

        return verdict == ReauthenticationVerdict.Proven
            ? Result.Success()
            : Result.Unauthorized(MessageOf(verdict, proof));
    }

    private async Task<ReauthenticationVerdict> VerdictOfAsync(
        Account account,
        ReauthenticationProof proof,
        CancellationToken ct
    ) =>
        proof switch
        {
            PasswordProof password => await VerdictOfPasswordAsync(account, password),
            PasskeyProof passkey => await VerdictOfPasskeyAsync(account, passkey, ct),
            _ => throw new ArgumentOutOfRangeException(nameof(proof), proof, null),
        };

    private async Task<ReauthenticationVerdict> VerdictOfPasskeyAsync(
        Account account,
        PasskeyProof proof,
        CancellationToken ct
    )
    {
        var asserted = await _passkeyService.VerifyAssertionAsync(proof.Assertion, ct);
        if (asserted?.Id == account.Id)
            return ReauthenticationVerdict.Proven;

        _logger.LogInformation(
            "Re-authentication by passkey failed for account {AccountId}",
            account.Id
        );
        return ReauthenticationVerdict.Wrong;
    }

    private async Task<ReauthenticationVerdict> VerdictOfPasswordAsync(
        Account account,
        PasswordProof proof
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

    [Pure]
    private static string MessageOf(ReauthenticationVerdict verdict, ReauthenticationProof proof) =>
        (verdict, proof) switch
        {
            (ReauthenticationVerdict.LockedOut, _) => LockedOutMessage,
            (_, PasskeyProof) => RejectedPasskeyMessage,
            _ => WrongPasswordMessage,
        };
}
