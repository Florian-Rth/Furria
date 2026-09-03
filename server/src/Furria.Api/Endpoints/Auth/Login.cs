using FastEndpoints;
using FluentValidation;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class Login : Endpoint<LoginRequest, LoginResponse>
{
    private readonly AccountService _accountService;

    public Login(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Post("auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        var session = await _accountService.LoginAsync(ToCommand(req), ct);
        if (!session.IsSuccess)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(session.Value), cancellation: ct);
    }

    private static LoginCommand ToCommand(LoginRequest request) =>
        new() { Email = request.Email, Password = request.Password };

    private static LoginResponse ToResponse(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
}

public sealed record LoginRequest
{
    public required string Email { get; init; }

    public required string Password { get; init; }
}

public sealed class LoginValidator : Validator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(request => request.Email).NotEmpty().EmailAddress();
        RuleFor(request => request.Password).NotEmpty();
    }
}

public sealed record LoginResponse
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
