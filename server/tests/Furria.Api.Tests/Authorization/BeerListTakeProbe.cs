using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class BeerListTakeProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/beer-list-take-probe");
        Definition.RequirePermission(FurriaPermissions.BeerListTake);
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
