using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerDeliveryTests : IClassFixture<ApiTestFixture>
{
    private const string Radler = "Radler";
    private const int Pallet = 40;

    private readonly ApiTestFixture _fixture;

    public PostBeerDeliveryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotHasBeenHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot(
                            "alter-topf",
                            "greta",
                            openedAt: now.AddDays(-200),
                            closedAt: now.AddDays(-2)
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf("alter-topf"),
                BeerDrinkId = BeerListCast.BeerOf(ctx),
                Crates = Pallet,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("alter-topf"))
            .ToHaveMovementCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StockOnlyTheDeliveredDrink_When_ThePotListsSeveralDrinks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRadlerAsync(radlerRetiredAt: null, ct);
        var potId = ctx.BeerList.Pots.IdOf("topf");
        var radlerId = ctx.BeerList.Drinks.IdOf(Radler);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
            new()
            {
                BeerPotId = potId,
                BeerDrinkId = radlerId,
                Crates = 5,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(potId)
            .ToHold(radlerId, 5)
            .BeerStockOfPot(potId)
            .ToHold(BeerListCast.BeerOf(ctx), 12)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithRadlerAsync(
        DateTimeOffset? radlerRetiredAt,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot("topf", "greta")
                            .AddBeerDrink("topf", Radler, retiredAt: radlerRetiredAt)
                            .AddBeerDelivery("topf", 12)
                    ),
            ct
        );

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
