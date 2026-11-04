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
public sealed class PutTablePlanTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutTablePlanTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheTablesAndCountTheVersionUp_When_TheVersionIsCurrent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);

        var (response, result) = await SavePlanAsync(
            client,
            eventId,
            hallId,
            1,
            [Row("r1", BiertischId, 2, groupId: "g1"), Row("r2", BiertischId, 2, groupId: "g1")],
            [
                new TableGroupDto
                {
                    Id = "g1",
                    Number = "7",
                    Note = "Elferrat",
                },
            ]
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.Version);
        var (_, plan) = await client.GETAsync<
            GetTablePlan,
            GetTablePlanRequest,
            GetTablePlanResponse
        >(new() { EventId = eventId });
        Assert.Equal("Elferrat", plan.Document.Groups.Single().Note);
        Assert.All(plan.Document.Rows, row => Assert.Equal("g1", row.GroupId));
    }

    [Fact]
    public async Task Should_Refuse_When_SomeoneSavedMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);
        await SavedPlanAsync(client, eventId, hallId, 1, [Row("r1", BiertischId, 1)]);

        var (response, _) = await SavePlanAsync(client, eventId, hallId, 1, []);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_ARowNamesAnUnknownTableType()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);

        var (response, _) = await SavePlanAsync(client, eventId, hallId, 1, [Row("r1", 999, 1)]);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_ARowNamesAGroupThePlanLacks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);

        var (response, _) = await SavePlanAsync(
            client,
            eventId,
            hallId,
            1,
            [Row("r1", BiertischId, 1, groupId: "g9")]
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventHasNoPlan()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var (response, _) = await SavePlanAsync(client, ctx.Club.Events.IdOf(Gala), hallId, 1, []);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
