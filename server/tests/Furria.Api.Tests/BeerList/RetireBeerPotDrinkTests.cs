using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class RetireBeerPotDrinkTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public RetireBeerPotDrinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RetireTheDrinkAndKeepItsHistory_When_NoCrateIsLeft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(Pot, Warden)
                    .AddBeerDrink(Pot, "Radler")
                    .AddBeerDelivery(Pot, 2, drink: "Radler")
                    .AddBeerCrates(Pot, Drinker, 2, drink: "Radler"),
            ct
        );
        var radlerId = ctx.BeerList.Drinks.IdOf("Radler");

        var response = await RetireAsync(ctx, radlerId, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveRetired(radlerId, _fixture.TimeProvider.GetUtcNow())
            .BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToListDrinks(("Bier", BeerListSeedBuilder.DefaultCratePriceCents))
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCratesOf(radlerId, 2, BeerListSeedBuilder.DefaultCratePriceCents)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveThePotWithoutDefault_When_TheDefaultDrinkIsRetired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerPot(Pot, Warden).AddBeerDrink(Pot, "Radler"),
            ct
        );

        var response = await RetireAsync(ctx, BeerOf(ctx), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_CratesOfTheDrinkAreLeft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(Pot, Warden)
                    .AddBeerDrink(Pot, "Radler")
                    .AddBeerDelivery(Pot, 1, drink: "Radler"),
            ct
        );

        var response = await RetireAsync(ctx, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToListDrinks(
                ("Bier", BeerListSeedBuilder.DefaultCratePriceCents),
                ("Radler", BeerListSeedBuilder.DefaultCratePriceCents)
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheDrinkIsAlreadyRetired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(Pot, Warden)
                    .AddBeerDrink(
                        Pot,
                        "Radler",
                        retiredAt: _fixture.TimeProvider.GetUtcNow().AddDays(-1)
                    ),
            ct
        );

        var response = await RetireAsync(ctx, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotHasBeenHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            beerList =>
                beerList.AddBeerPot(
                    Pot,
                    Warden,
                    openedAt: now.AddDays(-200),
                    closedAt: now.AddDays(-2)
                ),
            ct
        );

        var response = await RetireAsync(ctx, BeerOf(ctx), ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static async Task<HttpResponseMessage> RetireAsync(
        SeededContext ctx,
        int beerDrinkId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        return await client.POSTAsync<RetireBeerPotDrink, RetireBeerPotDrinkRequest>(
            new() { BeerPotId = ctx.BeerList.Pots.IdOf(Pot), BeerDrinkId = beerDrinkId }
        );
    }

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> beerList,
        CancellationToken ct
    ) => _fixture.BuildAsync(builder => WardenAndDrinker(builder).BeerList(beerList), ct);
}
