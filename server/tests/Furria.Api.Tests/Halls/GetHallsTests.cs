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
public sealed class GetHallsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetHallsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryHallByVenue_When_HallsWereDrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        await CreateHallAsync(client, ctx.Club.Venues.IdOf(Turnhalle), "Ganz");
        await CreateHallAsync(client, ctx.Club.Venues.IdOf(Buergerhaus), "Großer Saal");
        await CreateHallAsync(client, ctx.Club.Venues.IdOf(Turnhalle), "Halb");

        var (response, result) = await client.GETAsync<GetHalls, GetHallsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Bürgerhaus · Großer Saal", "Turnhalle · Ganz", "Turnhalle · Halb"],
            result.Halls.Select(hall => $"{hall.VenueName} · {hall.Name}")
        );
    }
}
