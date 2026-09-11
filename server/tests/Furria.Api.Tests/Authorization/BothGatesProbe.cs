using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class BothGatesProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/both-gates-probe");
        Definition.RequireAffiliation();
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
