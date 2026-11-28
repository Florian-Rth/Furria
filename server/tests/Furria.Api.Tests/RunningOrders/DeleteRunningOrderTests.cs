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
public sealed class DeleteRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheRunningOrderWithItsAppearances_When_APlannerDeletesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await CreateActAsync(client, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        await SavedAsync(client, eventId, null, [Line(tanz, 0)]);

        var response = await client.DELETEAsync<DeleteRunningOrder, DeleteRunningOrderRequest>(
            new() { EventId = eventId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RunningOrder(eventId)
            .ToNotExist()
            .RunningOrder(eventId)
            .ToHaveAppearancesOf()
            .AssertAsync(ct);
    }
}
