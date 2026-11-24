using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Core.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerPotHandoverTests : IClassFixture<ApiTestFixture>
{
    private const string Successor = "otto";
    private const int SuccessorsPrice = 16_00;
    private const string SuccessorsLink = "https://paypal.me/ottoott";
    private const string Radler = "Radler";

    private readonly ApiTestFixture _fixture;

    public PostBeerPotHandoverTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseThePotAndOpenTheSuccessorsWithTheCratesLeft_When_AnOperatorHandsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var wardenId = ctx.Identity.People.IdOf(Warden);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(ctx, potId, ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(7, result.CarriedCrates);
        await ctx
            .Expected.BeerPot(potId)
            .ToBeClosedAt(now)
            .BeerStockOfPot(potId)
            .ToEndWith(BeerStockMovementKind.HandedOver, -7, wardenId, now)
            .BeerStockOfPot(potId)
            .ToStandAt(0)
            .BeerPot(result.BeerPotId)
            .ToBeOwnedBy(ctx.Identity.People.IdOf(Successor))
            .BeerPot(result.BeerPotId)
            .ToHavePaymentLink(SuccessorsLink)
            .BeerPot(result.BeerPotId)
            .ToListDrinks(("Bier", SuccessorsPrice))
            .BeerPot(result.BeerPotId)
            .ToBeOpenedAt(now)
            .BeerStockOfPot(result.BeerPotId)
            .ToEndWith(BeerStockMovementKind.HandoverCarry, 7, wardenId, now)
            .BeerStockOfPot(result.BeerPotId)
            .ToStandAt(7)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnValidationAndKeepThePotOpen_When_TheSuccessorMayNotManageTheBeerList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(ctx, potId, ctx.Identity.People.IdOf(Drinker)));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ExpectUntouchedAsync(ctx, potId, ct);
    }

    [Fact]
    public async Task Should_HandOverOnlyOnce_When_TwoOperatorsHandOverAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var greta = await ctx.Identity.ClientForAsync(Warden, ct);
        var otto = await ctx.Identity.ClientForAsync(Successor, ct);
        var handover = HandoverTo(ctx, potId, ctx.Identity.People.IdOf(Successor));

        var responses = await _fixture.WhileBeerPotIsLockedAsync(
            potId,
            waitingSessions: 2,
            () =>
                Task.WhenAll(
                    greta.POSTAsync<PostBeerPotHandover, PostBeerPotHandoverRequest>(handover),
                    otto.POSTAsync<PostBeerPotHandover, PostBeerPotHandoverRequest>(handover)
                ),
            ct
        );

        Assert.Equal(
            [HttpStatusCode.OK, HttpStatusCode.Conflict],
            responses.Select(response => response.StatusCode).Order()
        );
        await ctx
            .Expected.BeerPots()
            .ToHaveCount(2)
            .BeerStockOfPot(potId)
            .ToStandAt(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BookTheCrateAndCarryTheRest_When_SheBooksDuringTheHandover()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var greta = await ctx.Identity.ClientForAsync(Warden, ct);
        var mira = await ctx.Identity.ClientForAsync(Drinker, ct);

        var (handover, booking) = await _fixture.WhileBeerPotIsLockedAsync(
            potId,
            waitingSessions: 2,
            async () =>
            {
                var handing = greta.POSTAsync<
                    PostBeerPotHandover,
                    PostBeerPotHandoverRequest,
                    PostBeerPotHandoverResponse
                >(HandoverTo(ctx, potId, ctx.Identity.People.IdOf(Successor)));
                var booking = mira.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(
                    new() { BeerDrinkId = BeerListCast.BeerOf(ctx), Count = 1 }
                );
                return (await handing, await booking);
            },
            ct
        );

        Assert.Equal(
            (HttpStatusCode.OK, HttpStatusCode.OK),
            (handover.Response.StatusCode, booking.StatusCode)
        );
        await ctx
            .Expected.BeerStockOfPot(potId)
            .ToStandAt(0)
            .BeerStockOfPot(handover.Result.BeerPotId)
            .ToStandAt(6)
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(4)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CarryEveryListedDrinkWithItsStockAtTheSuccessorsPrices_When_ThePotListsSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithDrinksAsync(ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var radlerId = ctx.BeerList.Drinks.IdOf(Radler);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(
            new()
            {
                BeerPotId = potId,
                SuccessorPersonId = ctx.Identity.People.IdOf(Successor),
                Drinks =
                [
                    new() { BeerDrinkId = radlerId, CratePriceCents = 13_00 },
                    new() { BeerDrinkId = BeerOf(ctx), CratePriceCents = SuccessorsPrice },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(11, result.CarriedCrates);
        await ctx
            .Expected.BeerPot(result.BeerPotId)
            .ToListDrinks(("Bier", SuccessorsPrice), (Radler, 13_00))
            .BeerPot(result.BeerPotId)
            .ToHaveDefaultDrink(Radler)
            .BeerStockOfPot(result.BeerPotId)
            .ToHold(BeerOf(ctx), 7)
            .BeerStockOfPot(result.BeerPotId)
            .ToHold(radlerId, 4)
            .BeerStockOfPot(potId)
            .ToStandAt(0)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithDrinksAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                WithSuccessor(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDrink(Pot, Radler, 12_00, isDefault: true)
                            .AddBeerDrink(
                                Pot,
                                "Alt",
                                retiredAt: _fixture.TimeProvider.GetUtcNow().AddDays(-1)
                            )
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerDelivery(Pot, 4, drink: Radler)
                            .AddBeerCrates(Pot, Drinker, 3)
                    ),
            ct
        );

    private static Task ExpectUntouchedAsync(SeededContext ctx, int potId, CancellationToken ct) =>
        ctx
            .Expected.BeerPots()
            .ToHaveCount(1)
            .BeerPot(potId)
            .ToBeOpen()
            .BeerStockOfPot(potId)
            .ToHaveMovementCount(1)
            .AssertAsync(ct);

    private static PostBeerPotHandoverRequest HandoverTo(
        SeededContext ctx,
        int beerPotId,
        int successorPersonId
    ) =>
        new()
        {
            BeerPotId = beerPotId,
            SuccessorPersonId = successorPersonId,
            PaymentLink = SuccessorsLink,
            Drinks = [new() { BeerDrinkId = BeerOf(ctx), CratePriceCents = SuccessorsPrice }],
        };

    private Task<SeededContext> BuildAsync(int delivered, int taken, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                WithSuccessor(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerDelivery(Pot, delivered)
                            .AddBeerCrates(Pot, Drinker, taken)
                    ),
            ct
        );

    private static SeedContextBuilder WithSuccessor(SeedContextBuilder builder) =>
        WardenAndDrinker(builder)
            .Identity(identity =>
                identity.AddPerson(Successor, "Otto", "Ott").AddAccount(Successor)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "schankhilfe",
                    "otto-schankhilfe",
                    "Schankhilfe",
                    Successor,
                    FurriaPermissions.BeerListManage
                )
            );
}
