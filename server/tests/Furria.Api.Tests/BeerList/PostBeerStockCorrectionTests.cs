using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Core.BeerList;
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
    public async Task Should_BookTheLossWithoutAReason_When_TheWardenTakesCratesOut()
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

        var response = await CorrectAsync(ctx, -2, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToEndWith(
                BeerStockMovementKind.Correction,
                -2,
                ctx.Identity.People.IdOf("greta"),
                _fixture.TimeProvider.GetUtcNow()
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RaiseTheStock_When_ACountFindsMoreCratesThanBooked()
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

        var response = await CorrectAsync(ctx, 3, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveMovementCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EmptyTheStock_When_TheCorrectionTakesTheLastCrates()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot("topf", "greta").AddBeerDelivery("topf", 3)
                    ),
            ct
        );

        var response = await CorrectAsync(ctx, -3, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveMovementCount(2)
            .AssertAsync(ct);
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

    private static async Task<HttpResponseMessage> CorrectAsync(
        SeededContext ctx,
        int crates,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("greta", ct);
        return await client.POSTAsync<PostBeerStockCorrection, PostBeerStockCorrectionRequest>(
            new() { BeerPotId = ctx.BeerList.Pots.IdOf("topf"), Crates = crates }
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
