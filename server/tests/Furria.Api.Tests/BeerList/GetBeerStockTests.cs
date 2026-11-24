using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerStockTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetBeerStockTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SubtractTakenCratesAndForecastFromThePaceAcrossPots_When_CratesWereBooked()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                BeerListCast
                    .WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                BeerListCast.Warden,
                                openedAt: now.AddDays(-90),
                                closedAt: now.AddDays(-15)
                            )
                            .AddBeerPot(
                                BeerListCast.Pot,
                                BeerListCast.Warden,
                                openedAt: now.AddDays(-15)
                            )
                            .AddBeerDelivery("alter-topf", 20, now.AddDays(-60))
                            .AddBeerCrates("alter-topf", BeerListCast.Drinker, 1, now.AddDays(-30))
                            .AddBeerCrates("alter-topf", BeerListCast.Drinker, 6, now.AddDays(-18))
                            .AddBeerDelivery(BeerListCast.Pot, 40, now.AddDays(-14))
                            .AddBeerCrates(
                                BeerListCast.Pot,
                                BeerListCast.Drinker,
                                6,
                                now.AddDays(-5)
                            )
                            .AddBeerCrate(
                                "zurueckgenommen",
                                BeerListCast.Pot,
                                BeerListCast.Drinker,
                                now.AddDays(-3),
                                undoneAt: now.AddDays(-3)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(BeerListCast.Warden, ct);
        var (_, result) = await client.GETAsync<
            GetBeerStock,
            GetBeerStockRequest,
            GetBeerStockResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf(BeerListCast.Pot) });

        var beer = Assert.Single(result.Drinks);
        Assert.Equal(34, beer.Crates);
        Assert.Equal(12, beer.Forecast.CratesTakenInPaceWindow);
        Assert.Equal(_fixture.Today.AddDays(34 * 21 / 12), beer.Forecast.ProjectedEmptyOn);
    }

    [Fact]
    public async Task Should_CountAndForecastEachDrinkOnItsOwnWithRetiredDrinksLast_When_ThePotListsSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                BeerListCast
                    .WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(BeerListCast.Pot, BeerListCast.Warden)
                            .AddBeerDrink(BeerListCast.Pot, "Radler", 12_00)
                            .AddBeerDrink(
                                BeerListCast.Pot,
                                "Alt",
                                13_00,
                                retiredAt: now.AddDays(-1)
                            )
                            .AddBeerDelivery(BeerListCast.Pot, 20, now.AddDays(-14))
                            .AddBeerDelivery(
                                BeerListCast.Pot,
                                10,
                                now.AddDays(-14),
                                drink: "Radler"
                            )
                            .AddBeerCrates(
                                BeerListCast.Pot,
                                BeerListCast.Drinker,
                                7,
                                now.AddDays(-5)
                            )
                            .AddBeerCrates(
                                BeerListCast.Pot,
                                BeerListCast.Drinker,
                                3,
                                now.AddDays(-5),
                                drink: "Radler"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(BeerListCast.Warden, ct);
        var (_, result) = await client.GETAsync<
            GetBeerStock,
            GetBeerStockRequest,
            GetBeerStockResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf(BeerListCast.Pot) });

        Assert.Equal(
            [
                ("Bier", 15_00, true, false, 13, 7, _fixture.Today.AddDays(13 * 21 / 7)),
                ("Radler", 12_00, false, false, 7, 3, _fixture.Today.AddDays(7 * 21 / 3)),
                ("Alt", 13_00, false, true, 0, 0, (DateOnly?)null),
            ],
            result.Drinks.Select(drink =>
                (
                    drink.Name,
                    drink.CratePriceCents,
                    drink.IsDefault,
                    drink.IsRetired,
                    drink.Crates,
                    drink.Forecast.CratesTakenInPaceWindow,
                    drink.Forecast.ProjectedEmptyOn
                )
            )
        );
    }
}
