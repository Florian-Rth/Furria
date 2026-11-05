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
public sealed class GetTablePlansTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetTablePlansTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryPlanLatestFirstWithItsTables_When_EventsHavePlans()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallManagerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(HallManager, ct);
        var gala = ctx.Club.Events.IdOf(Gala);
        var kinder = ctx.Club.Events.IdOf(KinderGala);
        var hallId = await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Saal");
        await CreatePlanAsync(client, gala, hallId);
        await CreatePlanAsync(client, kinder, hallId);
        await SavedPlanAsync(
            client,
            gala,
            hallId,
            1,
            [Row("r1", BeerTableId, 4), Row("r2", RoundTableId, 1)]
        );

        var (response, result) = await client.GETAsync<GetTablePlans, GetTablePlansResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Kindersitzung · Saal · 0", "1. Prunksitzung · Saal · 5"],
            result.Plans.Select(plan => $"{plan.Title} · {plan.HallName} · {plan.Tables}")
        );
    }
}
