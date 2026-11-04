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
public sealed class PostTablePlanTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostTablePlanTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StartAnEmptyComfortablePlan_When_NothingIsCopied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var response = await PostAsync(client, eventId, hallId, null);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var plan = await PlanOfAsync(client, eventId);
        Assert.Equal(1, plan.Version);
        Assert.Empty(plan.Document.Rows);
        Assert.Equal(SeatingMode.Comfortable, plan.Document.Seating);
    }

    [Fact]
    public async Task Should_TakeOverTheTables_When_APlanIsCopied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var kinder = ctx.Club.Events.IdOf(KinderGala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, gala, hallId);
        await SavedPlanAsync(client, gala, hallId, 1, [Row("r1", BiertischId, 6)]);

        await PostAsync(client, kinder, hallId, gala);

        var copied = await PlanOfAsync(client, kinder);
        Assert.Equal(6, copied.Document.Rows.Single().Count);
        Assert.Equal(1, copied.Version);
    }

    [Fact]
    public async Task Should_Refuse_When_TheEventHasAPlanAlready()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, eventId, hallId);

        var response = await PostAsync(client, eventId, hallId, null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheCopySourceHasNoPlan()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");

        var response = await PostAsync(
            client,
            ctx.Club.Events.IdOf(KinderGala),
            hallId,
            ctx.Club.Events.IdOf(Gala)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheHallIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);

        var response = await PostAsync(client, ctx.Club.Events.IdOf(Gala), 99_999, null);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PostAsync(
        HttpClient client,
        int eventId,
        int hallId,
        int? copyFromEventId
    ) =>
        client.POSTAsync<PostTablePlan, PostTablePlanRequest>(
            new()
            {
                EventId = eventId,
                HallId = hallId,
                CopyFromEventId = copyFromEventId,
            }
        );

    private static async Task<GetTablePlanResponse> PlanOfAsync(HttpClient client, int eventId)
    {
        var (_, plan) = await client.GETAsync<
            GetTablePlan,
            GetTablePlanRequest,
            GetTablePlanResponse
        >(new() { EventId = eventId });

        return plan;
    }
}
