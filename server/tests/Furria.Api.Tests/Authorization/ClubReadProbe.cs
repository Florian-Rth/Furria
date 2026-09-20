using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class ClubReadProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/club-read-probe");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
