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

    [Fact]
    public async Task Should_SplitEachGiversCratesByDrink_When_HeTookSeveralDrinks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDrink(Pot, "Radler")
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 2, drink: "Radler")
                            .AddBeerCrates(Pot, Drinker, 1)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (_, result) = await client.GETAsync<GetBeerGivers, GetBeerGiversResponse>();

        var giver = Assert.Single(result.Givers);
        Assert.Equal(3, giver.Crates);
        Assert.Equal(
            [
                (BeerListCast.BeerOf(ctx), "Bier", 1),
                (ctx.BeerList.Drinks.IdOf("Radler"), "Radler", 2),
            ],
            giver.Drinks.Select(drink => (drink.BeerDrinkId, drink.Name, drink.Crates))
        );
    }
}
