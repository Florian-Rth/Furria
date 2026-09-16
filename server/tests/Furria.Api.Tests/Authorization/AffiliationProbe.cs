using FastEndpoints;
using Furria.Api.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class AffiliationProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/affiliation-probe");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct) => await Send.NoContentAsync(ct);
}
