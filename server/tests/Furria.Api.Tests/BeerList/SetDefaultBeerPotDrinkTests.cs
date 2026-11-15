using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class SetDefaultBeerPotDrinkTests : IClassFixture<ApiTestFixture>
{
    private const string HandedOverPot = "alter-topf";

    private readonly ApiTestFixture _fixture;

    public SetDefaultBeerPotDrinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MakeTheDrinkTheOnlyDefault_When_AnOperatorMarksIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerPot(Pot, Warden).AddBeerDrink(Pot, "Radler"),
            ct
        );

        var response = await SetDefaultAsync(ctx, Pot, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink("Radler")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheDrinkTheDefault_When_ItIsAlreadyTheDefault()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(beerList => beerList.AddBeerPot(Pot, Warden), ct);

        var response = await SetDefaultAsync(ctx, Pot, BeerOf(ctx), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflictAndKeepTheDefault_When_TheDrinkIsRetired()
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

        var response = await SetDefaultAsync(ctx, Pot, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotHasBeenHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(
                        HandedOverPot,
                        Warden,
                        openedAt: now.AddDays(-200),
                        closedAt: now.AddDays(-2)
                    )
                    .AddBeerDrink(HandedOverPot, "Radler"),
            ct
        );

        var response = await SetDefaultAsync(
            ctx,
            HandedOverPot,
            ctx.BeerList.Drinks.IdOf("Radler"),
            ct
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(HandedOverPot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotDoesNotListTheDrink()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(
                        HandedOverPot,
                        Warden,
                        openedAt: now.AddDays(-200),
                        closedAt: now.AddDays(-2)
                    )
                    .AddBeerDrink(HandedOverPot, "Radler")
                    .AddBeerPot(Pot, Warden, openedAt: now.AddDays(-2)),
            ct
        );

        var response = await SetDefaultAsync(ctx, Pot, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> SetDefaultAsync(
        SeededContext ctx,
        string potAlias,
        int beerDrinkId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        return await client.POSTAsync<SetDefaultBeerPotDrink, SetDefaultBeerPotDrinkRequest>(
            new() { BeerPotId = ctx.BeerList.Pots.IdOf(potAlias), BeerDrinkId = beerDrinkId }
        );
    }

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> beerList,
        CancellationToken ct
    ) => _fixture.BuildAsync(builder => WardenAndDrinker(builder).BeerList(beerList), ct);
}
