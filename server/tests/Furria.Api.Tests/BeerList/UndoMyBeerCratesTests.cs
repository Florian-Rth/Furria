using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Core.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class UndoMyBeerCratesTests : IClassFixture<ApiTestFixture>
{
    private static readonly TimeSpan JustNow = TimeSpan.FromSeconds(4);

    private readonly ApiTestFixture _fixture;

    public UndoMyBeerCratesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheCratesBackAndRestoreTheStock_When_SheUndoesInsideTheWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("erste", Pot, Drinker, now - JustNow)
                            .AddBeerCrate("zweite", Pot, Drinker, now - JustNow)
                            .AddBeerCrate("gestern", Pot, Drinker, now.AddDays(-1))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<UndoMyBeerCrates, UndoMyBeerCratesRequest>(
            new()
            {
                CrateIds = [ctx.BeerList.Crates.IdOf("erste"), ctx.BeerList.Crates.IdOf("zweite")],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var miraId = ctx.Identity.People.IdOf(Drinker);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("erste"))
            .ToBeUndone(now, miraId)
            .BeerCrate(ctx.BeerList.Crates.IdOf("zweite"))
            .ToBeUndone(now, miraId)
            .BeerTabOf(miraId)
            .ToHaveTakenCrates(1)
            .BeerStockOfPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToStandAt(9)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepEveryCrate_When_OneOfThemLeftTheUndoWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("frisch", Pot, Drinker, now - JustNow)
                            .AddBeerCrate(
                                "zu-spaet",
                                Pot,
                                Drinker,
                                now - BeerCrate.UndoWindow - TimeSpan.FromSeconds(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<UndoMyBeerCrates, UndoMyBeerCratesRequest>(
            new()
            {
                CrateIds =
                [
                    ctx.BeerList.Crates.IdOf("frisch"),
                    ctx.BeerList.Crates.IdOf("zu-spaet"),
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("frisch"))
            .ToBeTaken()
            .BeerCrate(ctx.BeerList.Crates.IdOf("zu-spaet"))
            .ToBeTaken()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_SomeoneElseEnteredTheCrate()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate(
                                "von-greta",
                                Pot,
                                Drinker,
                                now - JustNow,
                                enteredByAlias: Warden
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<UndoMyBeerCrates, UndoMyBeerCratesRequest>(
            new() { CrateIds = [ctx.BeerList.Crates.IdOf("von-greta")] }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("von-greta"))
            .ToBeTaken()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCrateIsAlreadyUndone()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate(
                                "schon-weg",
                                Pot,
                                Drinker,
                                now - JustNow,
                                undoneAt: now - JustNow
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<UndoMyBeerCrates, UndoMyBeerCratesRequest>(
            new() { CrateIds = [ctx.BeerList.Crates.IdOf("schon-weg")] }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToStandAt(10)
            .AssertAsync(ct);
    }
}
