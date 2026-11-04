using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerPaymentTests : IClassFixture<ApiTestFixture>
{
    private const string FormerWarden = "otto";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public PostBeerPaymentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SettleHerOldestOpenCratesAtTheirOwnPrices_When_AnOperatorBooksAPayment()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, Price)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("bezahlt", Pot, Drinker, now.AddDays(-30))
                            .AddBeerCrate(
                                "zurueck",
                                Pot,
                                Drinker,
                                now.AddDays(-25),
                                undoneAt: now.AddDays(-25)
                            )
                            .AddBeerCrate(
                                "alt",
                                Pot,
                                Drinker,
                                now.AddDays(-20),
                                priceCents: OldPrice
                            )
                            .AddBeerCrate("mitte", Pot, Drinker, now.AddDays(-10))
                            .AddBeerCrate("neu", Pot, Drinker, now.AddDays(-2))
                            .AddBeerPayment("frueher", Pot, Drinker, 1, now.AddDays(-28))
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPayment,
            PostBeerPaymentRequest,
            PostBeerPaymentResponse
        >(
            new()
            {
                BeerPotId = potId,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Crates = 2,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal((2, OldPrice + Price), (result.Crates, result.AmountCents));
        await ctx
            .Expected.BeerPayment(result.BeerPaymentId)
            .ToSettle(2, OldPrice + Price, ctx.Identity.People.IdOf(Warden), now)
            .BeerCrate(ctx.BeerList.Crates.IdOf("alt"))
            .ToBePaidBy(result.BeerPaymentId)
            .BeerCrate(ctx.BeerList.Crates.IdOf("mitte"))
            .ToBePaidBy(result.BeerPaymentId)
            .BeerCrate(ctx.BeerList.Crates.IdOf("neu"))
            .ToBePaidBy(null)
            .BeerCrate(ctx.BeerList.Crates.IdOf("zurueck"))
            .ToBePaidBy(null)
            .BeerCrate(ctx.BeerList.Crates.IdOf("bezahlt"))
            .ToBePaidBy(ctx.BeerList.Payments.IdOf("frueher"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflictAndSettleNothing_When_ThePaymentCoversMoreCratesThanAreOpen()
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
                            .AddBeerPayment("frueher", Pot, Drinker, 1)
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<PostBeerPayment, PostBeerPaymentRequest>(
            new()
            {
                BeerPotId = potId,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Crates = 3,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(potId, open: 2, paid: 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SettleOnlyTheHandedOverPotsCrates_When_SheStillOwesTheFormerOwner()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity => identity.AddPerson(FormerWarden, "Otto", "Ott"))
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                FormerWarden,
                                OldPrice,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, Price, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates("alter-topf", Drinker, 2, now.AddDays(-50))
                            .AddBeerCrates(Pot, Drinker, 2, now.AddDays(-60))
                    ),
            ct
        );
        var oldPotId = ctx.BeerList.Pots.IdOf("alter-topf");
        var drinkerId = ctx.Identity.People.IdOf(Drinker);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPayment,
            PostBeerPaymentRequest,
            PostBeerPaymentResponse
        >(
            new()
            {
                BeerPotId = oldPotId,
                PersonId = drinkerId,
                Crates = 2,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2 * OldPrice, result.AmountCents);
        await ctx
            .Expected.BeerTabOf(drinkerId)
            .ToHaveOpenAndPaidCrates(oldPotId, open: 0, paid: 2)
            .BeerTabOf(drinkerId)
            .ToHaveOpenAndPaidCrates(ctx.BeerList.Pots.IdOf(Pot), open: 2, paid: 0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 1)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<PostBeerPayment, PostBeerPaymentRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf(Pot) + 1000,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Crates = 1,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_SettleTheCratesOnlyOnce_When_TwoOperatorsBookTheSamePaymentAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 2)
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var drinkerId = ctx.Identity.People.IdOf(Drinker);
        var first = await ctx.Identity.ClientForAsync(Warden, ct);
        var second = await ctx.Identity.ClientForAsync(Warden, ct);
        var request = new PostBeerPaymentRequest
        {
            BeerPotId = potId,
            PersonId = drinkerId,
            Crates = 2,
        };

        var responses = await _fixture.WhileBeerPotIsLockedAsync(
            potId,
            waitingSessions: 2,
            () =>
                Task.WhenAll(
                    first.POSTAsync<PostBeerPayment, PostBeerPaymentRequest>(request),
                    second.POSTAsync<PostBeerPayment, PostBeerPaymentRequest>(request)
                ),
            ct
        );

        Assert.Equal(
            [HttpStatusCode.OK, HttpStatusCode.Conflict],
            responses.Select(response => response.StatusCode).Order()
        );
        await ctx
            .Expected.BeerTabOf(drinkerId)
            .ToHaveOpenAndPaidCrates(potId, open: 0, paid: 2)
            .AssertAsync(ct);
    }
}
