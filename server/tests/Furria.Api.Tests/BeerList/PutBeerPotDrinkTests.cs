using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PutBeerPotDrinkTests : IClassFixture<ApiTestFixture>
{
    private const int RaisedPrice = 17_00;

    private readonly ApiTestFixture _fixture;

    public PutBeerPotDrinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenameTheDrinkEverywhereAndKeepTheCratePricesTaken_When_AnOperatorEditsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(
                        "alter-topf",
                        Warden,
                        openedAt: now.AddDays(-200),
                        closedAt: now.AddDays(-2)
                    )
                    .AddBeerDrink("alter-topf", "Veltnis")
                    .AddBeerPot(Pot, Warden, openedAt: now.AddDays(-2))
                    .AddBeerDrink(Pot, "Veltnis")
                    .AddBeerDelivery(Pot, 5, drink: "Veltnis")
                    .AddBeerCrates(Pot, Drinker, 1, drink: "Veltnis"),
            ct
        );
        var drinkId = ctx.BeerList.Drinks.IdOf("Veltnis");

        var response = await EditAsync(ctx, drinkId, "Veltins", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToListDrinks(
                ("Bier", BeerListSeedBuilder.DefaultCratePriceCents),
                ("Veltins", RaisedPrice)
            )
            .BeerPot(ctx.BeerList.Pots.IdOf("alter-topf"))
            .ToListDrinks(
                ("Bier", BeerListSeedBuilder.DefaultCratePriceCents),
                ("Veltins", BeerListSeedBuilder.DefaultCratePriceCents)
            )
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCratesOf(drinkId, 1, BeerListSeedBuilder.DefaultCratePriceCents)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheNewNameBelongsToAnotherDrink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerPot(Pot, Warden).AddBeerDrink(Pot, "Radler"),
            ct
        );

        var response = await EditAsync(ctx, ctx.BeerList.Drinks.IdOf("Radler"), "BIER", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToListDrinks(
                ("Bier", BeerListSeedBuilder.DefaultCratePriceCents),
                ("Radler", BeerListSeedBuilder.DefaultCratePriceCents)
            )
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> EditAsync(
        SeededContext ctx,
        int beerDrinkId,
        string name,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        return await client.PUTAsync<PutBeerPotDrink, PutBeerPotDrinkRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                BeerDrinkId = beerDrinkId,
                Name = name,
                CratePriceCents = RaisedPrice,
            }
        );
    }

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> beerList,
        CancellationToken ct
    ) => _fixture.BuildAsync(builder => WardenAndDrinker(builder).BeerList(beerList), ct);
}
