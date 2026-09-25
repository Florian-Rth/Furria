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
        if (!_tokenRateLimiter.TryAcquire(req.Token))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var session = await _accountAccessService.RedeemAsync(ToCommand(req), ct);
        if (session.IsSuccess)
        {
            await Send.OkAsync(ToResponse(session.Value), cancellation: ct);
            return;
        }

        if (session.Error.Kind == ResultErrorKind.Validation)
        {
            ValidationFailures.Add(new ValidationFailure(PasswordField, session.Error.Message));
            await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
            return;
        }

        await HttpContext.Response.SendFailureAsync(session.Error, ct);
    }

    private static RedeemInvitationCommand ToCommand(RedeemInvitationRequest request) =>
        new() { Token = request.Token, Password = request.Password };

    private static RedeemInvitationResponse ToResponse(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
}

public sealed record RedeemInvitationRequest
{
    public required string Token { get; init; }

    public required string Password { get; init; }
}

public sealed class RedeemInvitationValidator : Validator<RedeemInvitationRequest>
{
    public const int MinimumPasswordLength = 12;
    public const int MaximumPasswordLength = 256;

    public RedeemInvitationValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(InvitationTokenLimits.Length);
        RuleFor(request => request.Password)
            .NotEmpty()
            .MinimumLength(MinimumPasswordLength)
            .MaximumLength(MaximumPasswordLength);
    }
}

public sealed record RedeemInvitationResponse
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
