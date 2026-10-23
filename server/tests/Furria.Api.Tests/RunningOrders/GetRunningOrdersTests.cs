using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class GetRunningOrdersTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetRunningOrdersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListOnlyEventsWithARunningOrderAndTheirActsInOrder_When_Asked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        var finale = await CreateActAsync(client, "Finale");
        var tombola = await CreateActAsync(client, "Tombola");
        await SavedAsync(
            client,
            eventId,
            null,
            [Line(tombola, null), Line(finale, 1), Line(einmarsch, 0)]
        );

        var (response, result) = await client.GETAsync<
            GetRunningOrders,
            GetRunningOrdersResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var listed = Assert.Single(result.RunningOrders);
        Assert.Equal(eventId, listed.EventId);
        Assert.Equal("1. Prunksitzung", listed.Title);
        Assert.Equal([einmarsch, finale, tombola], listed.ActIds);
    }
}
