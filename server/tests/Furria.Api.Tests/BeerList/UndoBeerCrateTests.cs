using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class UndoBeerCrateTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public UndoBeerCrateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectTheCrateInHerNameAndRestoreTheStock_When_AnOperatorUndoesItLater()
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
                            .AddBeerCrate("versehen", Pot, Drinker, now.AddDays(-3))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerCrate, UndoBeerCrateRequest>(
            new() { BeerCrateId = ctx.BeerList.Crates.IdOf("versehen") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("versehen"))
            .ToBeUndone(now, ctx.Identity.People.IdOf(Warden))
            .BeerStockOfPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToStandAt(10)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheCratesPotHasBeenHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                Warden,
                                openedAt: now.AddDays(-200),
                                closedAt: now.AddDays(-2)
                            )
                            .AddBeerDelivery("alter-topf", 10, now.AddDays(-100))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("alt", "alter-topf", Drinker, now.AddDays(-20))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerCrate, UndoBeerCrateRequest>(
            new() { BeerCrateId = ctx.BeerList.Crates.IdOf("alt") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.BeerCrate(ctx.BeerList.Crates.IdOf("alt")).ToBeTaken().AssertAsync(ct);
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
                                now.AddDays(-1),
                                undoneAt: now.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerCrate, UndoBeerCrateRequest>(
            new() { BeerCrateId = ctx.BeerList.Crates.IdOf("schon-weg") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("schon-weg"))
            .ToBeUndone(now.AddDays(-1), null)
            .AssertAsync(ct);
    }
}
