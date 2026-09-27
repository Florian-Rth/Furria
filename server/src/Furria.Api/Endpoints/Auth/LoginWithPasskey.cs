using System.Text.Json;
using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class LoginWithPasskey : Endpoint<LoginWithPasskeyRequest, LoginWithPasskeyResponse>
{
    private readonly AccountService _accountService;

    public LoginWithPasskey(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Post("auth/login/passkey");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(LoginWithPasskeyRequest req, CancellationToken ct)
    {
        var session = await _accountService.LoginWithPasskeyAsync(ToAssertion(req), ct);
        if (!session.IsSuccess)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(session.Value), cancellation: ct);
    }

    private static PasskeyAssertion ToAssertion(LoginWithPasskeyRequest request) =>
        new()
        {
            ChallengeId = request.ChallengeId,
            CredentialJson = request.Credential.GetRawText(),
        };

    private static LoginWithPasskeyResponse ToResponse(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
}

public sealed record LoginWithPasskeyRequest
{
    public required string ChallengeId { get; init; }

    public required JsonElement Credential { get; init; }
}

public sealed class LoginWithPasskeyValidator : Validator<LoginWithPasskeyRequest>
{
    public LoginWithPasskeyValidator()
    {
        RuleFor(request => request.ChallengeId)
            .NotEmpty()
            .MaximumLength(PasskeyCeremonyLimits.ChallengeIdLength);
        RuleFor(request => request.Credential).Must(PasskeyCeremonyLimits.IsCredential);
    }
}

public sealed record LoginWithPasskeyResponse
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
