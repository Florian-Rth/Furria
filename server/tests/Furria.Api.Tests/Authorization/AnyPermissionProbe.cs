using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class AnyPermissionProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/any-permission-probe");
        Definition.RequireAnyPermission(
            FurriaPermissions.KeyHoldingsManage,
            FurriaPermissions.BoardManage
        );
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
