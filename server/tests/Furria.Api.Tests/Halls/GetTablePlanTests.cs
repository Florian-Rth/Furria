using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Endpoints.Seating;
using Furria.Api.Endpoints.TablePlans;
using Furria.Core.Halls;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Halls.HallSeeds;
using static Furria.Api.Tests.Halls.HallSteps;

namespace Furria.Api.Tests.Halls;

[SeedsAliases]
public sealed class GetTablePlanTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetTablePlanTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnThePlanWithItsHall_When_TheEventHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);
        await SavedPlanAsync(
            client,
            eventId,
            hallId,
            1,
            [Row("r1", PlainTableId, 3, groupId: null)]
        );

        var (response, plan) = await client.GETAsync<
            GetTablePlan,
            GetTablePlanRequest,
            GetTablePlanResponse
        >(new() { EventId = eventId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, plan.Version);
        Assert.Equal(hallId, plan.Hall.HallId);
        Assert.Equal("Bürgerhaus", plan.Hall.VenueName);
        Assert.Equal(3, plan.Document.Rows.Single().Count);
        Assert.Equal(SeatingMode.Comfortable, plan.Document.Seating);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventHasNoPlan()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);

        var (response, _) = await client.GETAsync<
            GetTablePlan,
            GetTablePlanRequest,
            GetTablePlanResponse
        >(new() { EventId = ctx.Club.Events.IdOf(Gala) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
