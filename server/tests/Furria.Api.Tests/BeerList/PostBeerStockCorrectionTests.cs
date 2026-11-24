using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerStockCorrectionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostBeerStockCorrectionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCorrectionWouldTakeTheStockBelowZero()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot("topf", "greta")
                            .AddBeerDelivery("topf", 3)
                            .AddBeerStockCorrection("topf", -2)
                    ),
            ct
        );

        var response = await CorrectAsync(ctx, -2, ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveMovementCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_OnlyAnotherDrinkHoldsTheCrates()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot("topf", "greta")
                            .AddBeerDrink("topf", "Radler")
                            .AddBeerDelivery("topf", 12)
                            .AddBeerDelivery("topf", 1, drink: "Radler")
                    ),
            ct
        );

        var response = await CorrectAsync(ctx, -2, ct, ctx.BeerList.Drinks.IdOf("Radler"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_TakeTheLeftoverCratesOut_When_TheDrinkIsRetired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot("topf", "greta")
                            .AddBeerDrink(
                                "topf",
                                "Radler",
                                retiredAt: _fixture.TimeProvider.GetUtcNow().AddDays(-1)
                            )
                            .AddBeerDelivery("topf", 1, drink: "Radler")
                    ),
            ct
        );
        var radlerId = ctx.BeerList.Drinks.IdOf("Radler");

        var response = await CorrectAsync(ctx, -1, ct, radlerId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHold(radlerId, 0)
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> CorrectAsync(
        SeededContext ctx,
        int crates,
        CancellationToken ct,
        int? beerDrinkId = null
    )
    {
        var client = await ctx.Identity.ClientForAsync("greta", ct);
        return await client.POSTAsync<PostBeerStockCorrection, PostBeerStockCorrectionRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf("topf"),
                BeerDrinkId = beerDrinkId ?? BeerListCast.BeerOf(ctx),
                Crates = crates,
            }
        );
    }

    private static SeedContextBuilder WithWarden(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("greta"))
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "getraenkewart",
                    "greta-getraenkewart",
                    "Getränkewart",
                    "greta",
                    FurriaPermissions.BeerListManage
                )
            );
}
