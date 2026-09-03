using FastEndpoints;
using Furria.Api.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class PermissionProbe : EndpointWithoutRequest
{
    public const string PermissionKey = "probe:read";

    public override void Configure()
    {
        Get("tests/permission-probe");
        Definition.RequirePermission(PermissionKey);
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
