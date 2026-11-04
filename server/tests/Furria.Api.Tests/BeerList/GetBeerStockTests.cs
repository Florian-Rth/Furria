using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Core.BeerList;
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
    public async Task Should_CountTheStockAndListItsHistoryNewestFirst_When_AnOperatorAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
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
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot("topf", "greta")
                            .AddBeerPot("anderer-topf", "greta", closedAt: now.AddDays(-20))
                            .AddBeerDelivery("anderer-topf", 50, now.AddDays(-25))
                            .AddBeerDelivery("topf", 24, now.AddDays(-12), "greta")
                            .AddBeerStockCorrection(
                                "topf",
                                2,
                                BeerStockCorrectionReason.Miscount,
                                now.AddDays(-1)
                            )
                            .AddBeerStockCorrection(
                                "topf",
                                -1,
                                BeerStockCorrectionReason.Shrinkage,
                                now.AddDays(-5),
                                "greta"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, result) = await client.GETAsync<
            GetBeerStock,
            GetBeerStockRequest,
            GetBeerStockResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf("topf") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(25, result.Crates);
        Assert.Equal(
            [
                (BeerStockMovementKind.Correction, 2, now.AddDays(-1)),
                (BeerStockMovementKind.Correction, -1, now.AddDays(-5)),
                (BeerStockMovementKind.Delivery, 24, now.AddDays(-12)),
            ],
            result.Movements.Select(movement => (movement.Kind, movement.Crates, movement.BookedAt))
        );
        Assert.Equal(BeerStockCorrectionReason.Shrinkage, result.Movements[1].Reason);
        Assert.Equal(ctx.Identity.People.IdOf("greta"), result.Movements[2].BookedBy?.PersonId);
        Assert.Null(result.Movements[0].BookedBy);
    }

    [Fact]
    public async Task Should_ProjectNoEmptyDay_When_NoCrateWasTakenInThePaceWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
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
                    )
                    .BeerList(beerList =>
                        beerList.AddBeerPot("topf", "greta").AddBeerDelivery("topf", 30)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (_, result) = await client.GETAsync<
            GetBeerStock,
            GetBeerStockRequest,
            GetBeerStockResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf("topf") });

        Assert.Equal(BeerStockForecast.PaceWindowDays, result.Forecast.PaceWindowDays);
        Assert.Equal(0, result.Forecast.CratesTakenInPaceWindow);
        Assert.Null(result.Forecast.ProjectedEmptyOn);
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

        Assert.Equal(34, result.Crates);
        Assert.Equal(12, result.Forecast.CratesTakenInPaceWindow);
        Assert.Equal(_fixture.Today.AddDays(34 * 21 / 12), result.Forecast.ProjectedEmptyOn);
    }
}
