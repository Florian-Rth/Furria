using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class BeerDrinksMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeDrinks = "20261113131156_MutedPushTopic";
    private const string HandedOverPot = "alter-topf";
    private const int OldPrice = 13_00;
    private const int Price = 14_50;

    private readonly ApiTestFixture _fixture;

    public BeerDrinksMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListBeerOnEveryPotAtItsPriceAndKeepEveryCrate_When_TheListLearnsDrinks()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var warnedAt = now.AddDays(-2);
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                HandedOverPot,
                                Warden,
                                OldPrice,
                                openedAt: now.AddDays(-200),
                                closedAt: now.AddDays(-20)
                            )
                            .AddBeerDelivery(HandedOverPot, 10, now.AddDays(-100))
                            .AddBeerCrates(HandedOverPot, Drinker, 4, now.AddDays(-50))
                            .AddBeerPot(
                                Pot,
                                Warden,
                                Price,
                                openedAt: now.AddDays(-20),
                                stockWarningSentAt: warnedAt
                            )
                            .AddBeerDelivery(Pot, 6, now.AddDays(-10))
                            .AddBeerCrates(Pot, Drinker, 2, now.AddDays(-5))
                    ),
            ct
        );
        await _fixture.MigrateDatabaseToAsync(BeforeDrinks, ct);

        await _fixture.RunDatabaseMigratorAsync(ct);

        var handedOverPotId = ctx.BeerList.Pots.IdOf(HandedOverPot);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        await ctx
            .Expected.BeerPot(handedOverPotId)
            .ToListDrinks(("Bier", OldPrice))
            .BeerPot(handedOverPotId)
            .ToHaveWarnedOf("Bier", null)
            .BeerPot(handedOverPotId)
            .ToHaveDefaultDrink("Bier")
            .BeerStockOfPot(handedOverPotId)
            .ToStandAt(6)
            .BeerPot(potId)
            .ToListDrinks(("Bier", Price))
            .BeerPot(potId)
            .ToHaveWarnedOf("Bier", warnedAt)
            .BeerPot(potId)
            .ToHaveDefaultDrink("Bier")
            .BeerStockOfPot(potId)
            .ToStandAt(4)
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(6)
            .AssertAsync(ct);
    }
}
