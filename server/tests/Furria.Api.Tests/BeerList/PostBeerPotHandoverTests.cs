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
    private const int UnknownPersonId = 999_997;
    private const int UnknownPotId = 999_996;
    private const int SuccessorsPrice = 16_00;
    private const string SuccessorsLink = "https://paypal.me/ottoott";

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
        >(HandoverTo(potId, ctx.Identity.People.IdOf(Successor)));

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
            .ToHaveSettings(SuccessorsPrice, SuccessorsLink)
            .BeerPot(result.BeerPotId)
            .ToBeOpenedAt(now)
            .BeerStockOfPot(result.BeerPotId)
            .ToEndWith(BeerStockMovementKind.HandoverCarry, 7, wardenId, now)
            .BeerStockOfPot(result.BeerPotId)
            .ToStandAt(7)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheOpenCratesOwedInTheHandedOverPot_When_TheSuccessorTakesOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(potId, ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(potId, 3, 0)
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(result.BeerPotId, 0, 0)
            .BeerPot(potId)
            .ToBeOwnedBy(ctx.Identity.People.IdOf(Warden))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CarryEveryCrate_When_MoreAreLeftThanOneDeliveryBrings()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithSuccessor(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, BeerStockMovement.MaxCrates)
                            .AddBeerDelivery(Pot, BeerStockMovement.MaxCrates)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(ctx.BeerList.Pots.IdOf(Pot), ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BeerStockOfPot(result.BeerPotId)
            .ToStandAt(2 * BeerStockMovement.MaxCrates)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenTheSuccessorsPotWithoutAnyMovement_When_NoCrateIsLeft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 3, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(potId, ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, result.CarriedCrates);
        await ctx
            .Expected.BeerStockOfPot(potId)
            .ToHaveMovementCount(1)
            .BeerStockOfPot(result.BeerPotId)
            .ToHaveMovementCount(0)
            .BeerPots()
            .ToHaveCount(2)
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
        >(HandoverTo(potId, ctx.Identity.People.IdOf(Drinker)));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ExpectUntouchedAsync(ctx, potId, ct);
    }

    [Fact]
    public async Task Should_ReturnValidationAndKeepThePotOpen_When_TheSuccessorAlreadyOwnsThePot()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(potId, ctx.Identity.People.IdOf(Warden)));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ExpectUntouchedAsync(ctx, potId, ct);
    }

    [Fact]
    public async Task Should_ReturnNotFoundAndKeepThePotOpen_When_TheSuccessorIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(potId, UnknownPersonId));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ExpectUntouchedAsync(ctx, potId, ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(UnknownPotId, ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotIsAlreadyHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithSuccessor(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot(
                            Pot,
                            Warden,
                            openedAt: now.AddDays(-100),
                            closedAt: now.AddDays(-5)
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPotHandover,
            PostBeerPotHandoverRequest,
            PostBeerPotHandoverResponse
        >(HandoverTo(ctx.BeerList.Pots.IdOf(Pot), ctx.Identity.People.IdOf(Successor)));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HandOverOnlyOnce_When_TwoOperatorsHandOverAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(delivered: 10, taken: 3, ct);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var greta = await ctx.Identity.ClientForAsync(Warden, ct);
        var otto = await ctx.Identity.ClientForAsync(Successor, ct);
        var handover = HandoverTo(potId, ctx.Identity.People.IdOf(Successor));

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
                >(HandoverTo(potId, ctx.Identity.People.IdOf(Successor)));
                var booking = mira.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(
                    new() { Count = 1 }
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

    private static Task ExpectUntouchedAsync(SeededContext ctx, int potId, CancellationToken ct) =>
        ctx
            .Expected.BeerPots()
            .ToHaveCount(1)
            .BeerPot(potId)
            .ToBeOpen()
            .BeerStockOfPot(potId)
            .ToHaveMovementCount(1)
            .AssertAsync(ct);

    private static PostBeerPotHandoverRequest HandoverTo(int beerPotId, int successorPersonId) =>
        new()
        {
            BeerPotId = beerPotId,
            SuccessorPersonId = successorPersonId,
            CratePriceCents = SuccessorsPrice,
            PaymentLink = SuccessorsLink,
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
