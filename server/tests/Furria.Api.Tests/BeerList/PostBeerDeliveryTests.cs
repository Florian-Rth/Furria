using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Core.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerDeliveryTests : IClassFixture<ApiTestFixture>
{
    private const int UnknownPotId = 999_996;
    private const int Pallet = 40;

    private readonly ApiTestFixture _fixture;

    public PostBeerDeliveryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BookTheDeliveryInHerName_When_AnOperatorBooksIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot("topf", "greta").AddBeerDelivery("topf", 12)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
            new() { BeerPotId = ctx.BeerList.Pots.IdOf("topf"), Crates = Pallet }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveMovementCount(2)
            .BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToEndWith(
                BeerStockMovementKind.Delivery,
                Pallet,
                null,
                ctx.Identity.People.IdOf("greta"),
                _fixture.TimeProvider.GetUtcNow()
            )
            .AssertAsync(ct);
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
            new() { BeerPotId = ctx.BeerList.Pots.IdOf("alter-topf"), Crates = Pallet }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("alter-topf"))
            .ToHaveMovementCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => WithWarden(builder), ct);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
            new() { BeerPotId = UnknownPotId, Crates = Pallet }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
