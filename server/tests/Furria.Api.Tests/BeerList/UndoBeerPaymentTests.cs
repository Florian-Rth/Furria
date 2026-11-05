using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class UndoBeerPaymentTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public UndoBeerPaymentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReopenItsCratesInHerName_When_AnOperatorCorrectsAPayment()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 3, now.AddDays(-10))
                            .AddBeerPayment("erste", Pot, Drinker, 1, now.AddDays(-8))
                            .AddBeerPayment("vertippt", Pot, Drinker, 2, now.AddDays(-1))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerPayment, UndoBeerPaymentRequest>(
            new() { BeerPaymentId = ctx.BeerList.Payments.IdOf("vertippt") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPayment(ctx.BeerList.Payments.IdOf("vertippt"))
            .ToBeUndone(now, ctx.Identity.People.IdOf(Warden))
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(ctx.BeerList.Pots.IdOf(Pot), open: 2, paid: 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReopenItsCrates_When_ThePotHasBeenHandedOver()
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
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates("alter-topf", Drinker, 2, now.AddDays(-20))
                            .AddBeerPayment("alt", "alter-topf", Drinker, 2, now.AddDays(-1))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerPayment, UndoBeerPaymentRequest>(
            new() { BeerPaymentId = ctx.BeerList.Payments.IdOf("alt") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(ctx.BeerList.Pots.IdOf("alter-topf"), open: 2, paid: 0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePaymentIsAlreadyCorrected()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 1, now.AddDays(-10))
                            .AddBeerPayment(
                                "schon-weg",
                                Pot,
                                Drinker,
                                1,
                                now.AddDays(-2),
                                undoneAt: now.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<UndoBeerPayment, UndoBeerPaymentRequest>(
            new() { BeerPaymentId = ctx.BeerList.Payments.IdOf("schon-weg") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPayment(ctx.BeerList.Payments.IdOf("schon-weg"))
            .ToBeUndone(now.AddDays(-1), null)
            .AssertAsync(ct);
    }
}
