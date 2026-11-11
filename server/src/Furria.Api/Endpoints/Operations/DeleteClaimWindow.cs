using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Operations;

public sealed class DeleteClaimWindow : EndpointWithoutRequest
{
    private readonly ClaimWindowService _claimWindowService;

    public DeleteClaimWindow(ClaimWindowService claimWindowService)
    {
        _claimWindowService = claimWindowService;
    }

    public override void Configure()
    {
        Delete("system/claim-window");
        Definition.RequirePermission(FurriaPermissions.ClaimWindowManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await _claimWindowService.CloseAsync(ct);

        await Send.NoContentAsync(ct);
    }
}
