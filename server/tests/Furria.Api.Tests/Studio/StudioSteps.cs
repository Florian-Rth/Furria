using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common.Builder;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Studio;

internal static class StudioSteps
{
    internal static async Task<int> GardetanzAsync(
        SeededContext ctx,
        CancellationToken ct,
        IReadOnlyList<int>? added = null,
        IReadOnlyList<int>? removed = null,
        string name = "Gardetanz"
    )
    {
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        return await CreateActAsync(
            admin,
            name,
            ctx.Groups.Groups.IdOf(Garde),
            ActKind.Dance,
            added: added,
            removed: removed
        );
    }

    internal static async Task<GetActStudioResponse> StudioOfAsync(HttpClient client, int actId)
    {
        var (response, result) = await client.GETAsync<
            GetActStudio,
            GetActStudioRequest,
            GetActStudioResponse
        >(new() { ActId = actId });
        response.EnsureSuccessStatusCode();

        return result;
    }

    internal static async Task GrantCoEditorAsync(HttpClient client, int actId, int personId)
    {
        var response = await client.PUTAsync<PutActCoEditor, PutActCoEditorRequest>(
            new() { ActId = actId, PersonId = personId }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
