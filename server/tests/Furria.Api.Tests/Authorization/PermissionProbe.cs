using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class PermissionProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/permission-probe");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
