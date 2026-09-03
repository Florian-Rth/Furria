using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class Logout : Endpoint<LogoutRequest>
{
    private readonly AccountService _accountService;

    public Logout(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Post("auth/logout");
    }

    public override async Task HandleAsync(LogoutRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _accountService.LogoutAsync(req.RefreshToken, accountId.Value, ct);
        await Send.NoContentAsync(ct);
    }
}

public sealed record LogoutRequest
{
    public required string RefreshToken { get; init; }
}

public sealed class LogoutValidator : Validator<LogoutRequest>
{
    public LogoutValidator()
    {
        RuleFor(request => request.RefreshToken).NotEmpty();
    }
}
