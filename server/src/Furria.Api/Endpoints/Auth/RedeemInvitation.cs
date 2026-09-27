using System.Diagnostics.Contracts;
using System.Text.Json;
using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class RedeemInvitation : Endpoint<RedeemInvitationRequest, RedeemInvitationResponse>
{
    private const string PasswordField = "password";
    private const string LoginEmailField = "loginEmail";
    private const string ConfirmationCodeField = "confirmationCode";
    private const string ClaimPasswordField = "claimPassword";
    private const string ClaimPasskeyField = "claimPasskey";
    private const string TakenLoginEmailMessage =
        "Diese E-Mail-Adresse gehört schon zu einem Zugang. Wähle eine andere.";
    private const string MissingLoginEmailMessage =
        "Gib die E-Mail-Adresse ein, mit der du dich anmelden willst.";
    private const string WrongConfirmationCodeMessage =
        "Der Code stimmt nicht. Prüf die Mail und versuch es noch einmal.";
    private const string DeadConfirmationCodeMessage =
        "Dieser Code gilt nicht mehr. Lass dir einen neuen schicken.";
    private const string WrongClaimPasswordMessage =
        "Das Passwort passt nicht zu diesem Zugang. Nach fünf Fehlversuchen ist er 15 Minuten gesperrt.";
    private const string RejectedClaimPasskeyMessage =
        "Der Passkey konnte für diesen Zugang nicht bestätigt werden. Versuch es noch einmal.";

    private readonly AccountAccessService _accountAccessService;
    private readonly InvitationTokenRateLimiter _tokenRateLimiter;

    public RedeemInvitation(
        AccountAccessService accountAccessService,
        InvitationTokenRateLimiter tokenRateLimiter
    )
    {
        _accountAccessService = accountAccessService;
        _tokenRateLimiter = tokenRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/invitations/redeem");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(RedeemInvitationRequest req, CancellationToken ct)
    {
        var command = ToCommand(req);
        if (!_tokenRateLimiter.TryAcquire(command.Credential))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var redemption = await _accountAccessService.RedeemAsync(command, ct);
        if (!redemption.IsSuccess)
        {
            await SendRefusalAsync(redemption.Error, ct);
            return;
        }

        if (RefusalOf(redemption.Value.Outcome) is { } refusal)
        {
            ValidationFailures.Add(new ValidationFailure(refusal.Field, refusal.Message));
            await Send.ErrorsAsync(refusal.StatusCode, ct);
            return;
        }

        await Send.OkAsync(ToResponse(redemption.Value), cancellation: ct);
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        if (error.Kind == ResultErrorKind.Validation)
        {
            ValidationFailures.Add(new ValidationFailure(PasswordField, error.Message));
            await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
            return;
        }

        await HttpContext.Response.SendFailureAsync(error, ct);
    }

    [Pure]
    private static RedemptionRefusal? RefusalOf(RedemptionOutcome outcome) =>
        outcome switch
        {
            RedemptionOutcome.LoginEmailTaken => new RedemptionRefusal(
                LoginEmailField,
                TakenLoginEmailMessage,
                StatusCodes.Status409Conflict
            ),
            RedemptionOutcome.ConfirmationCodeWrong => new RedemptionRefusal(
                ConfirmationCodeField,
                WrongConfirmationCodeMessage,
                StatusCodes.Status400BadRequest
            ),
            RedemptionOutcome.ConfirmationCodeDead => new RedemptionRefusal(
                ConfirmationCodeField,
                DeadConfirmationCodeMessage,
                StatusCodes.Status400BadRequest
            ),
            RedemptionOutcome.ClaimPasswordWrong => new RedemptionRefusal(
                ClaimPasswordField,
                WrongClaimPasswordMessage,
                StatusCodes.Status400BadRequest
            ),
            RedemptionOutcome.LoginEmailMissing => new RedemptionRefusal(
                LoginEmailField,
                MissingLoginEmailMessage,
                StatusCodes.Status400BadRequest
            ),
            RedemptionOutcome.ClaimPasskeyRejected => new RedemptionRefusal(
                ClaimPasskeyField,
                RejectedClaimPasskeyMessage,
                StatusCodes.Status400BadRequest
            ),
            _ => null,
        };

    private static RedeemInvitationCommand ToCommand(RedeemInvitationRequest request) =>
        new()
        {
            Credential = new InvitationCredential { Token = request.Token, Code = request.Code },
            Password = request.Password,
            LoginEmail = request.LoginEmail,
            ConfirmationCode = request.ConfirmationCode,
            ClaimProof = ToClaimProof(request),
            UpdateContactEmail = request.UpdateContactEmail,
        };

    [Pure]
    private static ReauthenticationProof? ToClaimProof(RedeemInvitationRequest request) =>
        (request.ClaimPassword, request.ClaimPasskey) switch
        {
            (null, { } passkey) => new PasskeyProof
            {
                Assertion = new PasskeyAssertion
                {
                    ChallengeId = passkey.ChallengeId,
                    CredentialJson = passkey.Credential.GetRawText(),
                },
            },
            ({ } password, _) => new PasswordProof { Password = password },
            _ => null,
        };

    private static RedeemInvitationResponse ToResponse(RedemptionDetails redemption) =>
        new()
        {
            Outcome = ToDto(redemption.Outcome),
            Session = redemption.Session is { } session ? ToDto(session) : null,
            ConfirmationExpiresAt = redemption.ConfirmationExpiresAt,
        };

    [Pure]
    private static RedeemInvitationOutcome ToDto(RedemptionOutcome outcome) =>
        outcome switch
        {
            RedemptionOutcome.Redeemed => RedeemInvitationOutcome.Redeemed,
            RedemptionOutcome.ConfirmationRequired => RedeemInvitationOutcome.ConfirmationRequired,
            RedemptionOutcome.ClaimRequired => RedeemInvitationOutcome.ClaimRequired,
            _ => throw new ArgumentOutOfRangeException(nameof(outcome), outcome, null),
        };

    private static RedeemInvitationSessionDto ToDto(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };

    private sealed record RedemptionRefusal(string Field, string Message, int StatusCode);
}

public sealed record RedeemInvitationRequest
{
    public string? Token { get; init; }

    public string? Code { get; init; }

    public string? Password { get; init; }

    public string? LoginEmail { get; init; }

    public string? ConfirmationCode { get; init; }

    public string? ClaimPassword { get; init; }

    public RedeemInvitationPasskeyDto? ClaimPasskey { get; init; }

    public bool UpdateContactEmail { get; init; } = true;
}

public sealed record RedeemInvitationPasskeyDto
{
    public required string ChallengeId { get; init; }

    public required JsonElement Credential { get; init; }
}

public sealed class RedeemInvitationValidator : Validator<RedeemInvitationRequest>
{
    private const string OneClaimProofMessage =
        "Bestätige den Zugang entweder mit dem Passwort oder mit dem Passkey.";

    public const int MaximumPasswordLength = 256;
    public const int MaximumLoginEmailLength = 256;
    public const int MaximumConfirmationCodeLength = 16;

    public RedeemInvitationValidator()
    {
        RuleFor(request => request)
            .Must(request =>
                InvitationTokenLimits.HasExactlyOneCredential(request.Token, request.Code)
            )
            .OverridePropertyName(InvitationTokenLimits.CredentialField)
            .WithMessage(InvitationTokenLimits.ExactlyOneCredentialMessage);
        When(
            request => request.Token is not null,
            () =>
                RuleFor(request => request.Token)
                    .NotEmpty()
                    .MaximumLength(InvitationTokenLimits.Length)
        );
        When(
            request => request.Code is not null,
            () =>
                RuleFor(request => request.Code)
                    .NotEmpty()
                    .MaximumLength(InvitationTokenLimits.CodeLength)
        );
        RuleFor(request => request)
            .Must(request => request.ClaimPassword is null || request.ClaimPasskey is null)
            .OverridePropertyName("claimPasskey")
            .WithMessage(OneClaimProofMessage);
        When(
            request => !IsClaim(request) || request.Password is not null,
            () =>
                RuleFor(request => request.Password)
                    .NotEmpty()
                    .MinimumLength(PasswordRule.MinimumLength)
                    .MaximumLength(MaximumPasswordLength)
        );
        When(
            request => request.ClaimPassword is not null,
            () =>
                RuleFor(request => request.ClaimPassword)
                    .NotEmpty()
                    .MaximumLength(MaximumPasswordLength)
        );
        When(
            request => request.ClaimPasskey is not null,
            () =>
            {
                RuleFor(request => request.ClaimPasskey!.ChallengeId)
                    .NotEmpty()
                    .MaximumLength(PasskeyCeremonyLimits.ChallengeIdLength)
                    .OverridePropertyName("claimPasskey.challengeId");
                RuleFor(request => request.ClaimPasskey!.Credential)
                    .Must(PasskeyCeremonyLimits.IsCredential)
                    .OverridePropertyName("claimPasskey.credential");
            }
        );
        When(
            request => request.LoginEmail is not null,
            () =>
                RuleFor(request => request.LoginEmail)
                    .NotEmpty()
                    .EmailAddress()
                    .MaximumLength(MaximumLoginEmailLength)
        );
        When(
            request => request.ConfirmationCode is not null,
            () =>
                RuleFor(request => request.ConfirmationCode)
                    .NotEmpty()
                    .MaximumLength(MaximumConfirmationCodeLength)
        );
    }

    [Pure]
    private static bool IsClaim(RedeemInvitationRequest request) =>
        request.ClaimPassword is not null || request.ClaimPasskey is not null;
}

public enum RedeemInvitationOutcome
{
    Redeemed = 1,
    ConfirmationRequired = 2,
    ClaimRequired = 3,
}

public sealed record RedeemInvitationResponse
{
    public required RedeemInvitationOutcome Outcome { get; init; }

    public required RedeemInvitationSessionDto? Session { get; init; }

    public required DateTimeOffset? ConfirmationExpiresAt { get; init; }
}

public sealed record RedeemInvitationSessionDto
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
