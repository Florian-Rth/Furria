using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class LogoutEverywhere : EndpointWithoutRequest
{
    private readonly AccountSecurityService _accountSecurityService;

    public LogoutEverywhere(AccountSecurityService accountSecurityService)
    {
        _accountSecurityService = accountSecurityService;
    }

    public override void Configure()
    {
        Post("auth/me/logout-everywhere");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _accountSecurityService.LogOutEverywhereAsync(accountId.Value, ct);
        await Send.NoContentAsync(ct);
    }
}
