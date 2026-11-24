using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerGiversTests : IClassFixture<ApiTestFixture>
{
    private const string Anton = "anton";
    private const string Zoe = "zoe";

    private readonly ApiTestFixture _fixture;

    public GetBeerGiversTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CountTheCratesEachPersonGaveFromTheOpenPotByName_When_AnEnrolledMemberAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity.AddPerson(Anton, "Anton", "Zeller").AddPerson(Zoe, "Zoë", "Abel")
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                Warden,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates("alter-topf", Anton, 9, now.AddDays(-60))
                            .AddBeerCrates(Pot, Anton, 2)
                            .AddBeerCrates(Pot, Zoe, 1)
                            .AddBeerCrates(Pot, Drinker, 3)
                            .AddBeerCrate("zurueck", Pot, Drinker, undoneAt: now)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, result) = await client.GETAsync<GetBeerGivers, GetBeerGiversResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [("Abel", 1), ("Maier", 3), ("Zeller", 2)],
            result.Givers.Select(giver => (giver.LastName, giver.Crates))
        );
    }
}
