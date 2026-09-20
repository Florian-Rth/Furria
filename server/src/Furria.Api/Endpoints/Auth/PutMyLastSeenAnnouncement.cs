using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyLastSeenAnnouncement : EndpointWithoutRequest
{
    private readonly AccountService _accountService;

    public PutMyLastSeenAnnouncement(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Put("auth/me/last-seen-announcement");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _accountService.MarkAnnouncementsSeenAsync(accountId.Value, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
