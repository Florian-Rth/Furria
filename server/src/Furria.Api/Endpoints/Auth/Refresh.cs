using FastEndpoints;
using FluentValidation;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class Refresh : Endpoint<RefreshRequest, RefreshResponse>
{
    private readonly AccountService _accountService;

    public Refresh(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Post("auth/refresh");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RefreshRequest req, CancellationToken ct)
    {
        var session = await _accountService.RefreshSessionAsync(req.RefreshToken, ct);
        if (!session.IsSuccess)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(session.Value), cancellation: ct);
    }

    private static RefreshResponse ToResponse(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
}

public sealed record RefreshRequest
{
    public required string RefreshToken { get; init; }
}

public sealed class RefreshValidator : Validator<RefreshRequest>
{
    public RefreshValidator()
    {
        RuleFor(request => request.RefreshToken).NotEmpty();
    }
}

public sealed record RefreshResponse
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
