using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerCratesForPersonTests : IClassFixture<ApiTestFixture>
{
    private const int RadlerPrice = 12_00;
    private const string Radler = "Radler";
    private const int CratePrice = 16_00;
    private const string Stranger = "tom";

    private readonly ApiTestFixture _fixture;

    public PostBeerCratesForPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BookTheCratesOnAFormerEnrolleesTabInTheOperatorsName_When_SheHasHistory()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, CratePrice)
                            .AddBeerDelivery(Pot, 30)
                            .AddBeerListEnrollment(
                                "mira-bier",
                                Drinker,
                                now.AddDays(-60),
                                now.AddDays(-2)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest,
            PostBeerCratesForPersonResponse
        >(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                PersonId = ctx.Identity.People.IdOf(Drinker),
                BeerDrinkId = BeerListCast.BeerOf(ctx),
                Count = 12,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(12, result.CrateIds.Count);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var miraId = ctx.Identity.People.IdOf(Drinker);
        await ctx
            .Expected.BeerTabOf(miraId)
            .ToEndWithCratesOf(12, potId, CratePrice, ctx.Identity.People.IdOf(Warden), now)
            .BeerStockOfPot(potId)
            .ToStandAt(18)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SettleHerOldestOpenCratesFirst_When_SheAlreadyOwesOlderCratesAndTheNewOnesArePaid()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, CratePrice)
                            .AddBeerDelivery(Pot, 30)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("alt", Pot, Drinker, now.AddDays(-9))
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest,
            PostBeerCratesForPersonResponse
        >(
            new()
            {
                BeerPotId = potId,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                BeerDrinkId = BeerListCast.BeerOf(ctx),
                Count = 2,
                Paid = true,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.BeerPaymentId);
        await ctx
            .Expected.BeerCrate(ctx.BeerList.Crates.IdOf("alt"))
            .ToBePaidBy(result.BeerPaymentId)
            .BeerCrate(result.CrateIds[0])
            .ToBePaidBy(result.BeerPaymentId)
            .BeerCrate(result.CrateIds[1])
            .ToBePaidBy(null)
            .BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(potId, 1, 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BookNeitherCratesNorAPayment_When_PaidCratesWouldEmptyTheStockBelowZero()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 1)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest
        >(
            new()
            {
                BeerPotId = potId,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                BeerDrinkId = BeerListCast.BeerOf(ctx),
                Count = 2,
                Paid = true,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveOpenAndPaidCrates(potId, 0, 0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheBooking_When_ThePersonWasNeverEnrolled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity => identity.AddPerson(Stranger))
                    .BeerList(beerList =>
                        beerList.AddBeerPot(Pot, Warden).AddBeerDelivery(Pot, 30)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest
        >(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                PersonId = ctx.Identity.People.IdOf(Stranger),
                BeerDrinkId = BeerListCast.BeerOf(ctx),
                Count = 1,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Stranger))
            .ToHaveTakenCrates(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheBooking_When_OnlyAnotherDrinkHasCratesLeft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRadlerAsync(radlerRetiredAt: null, ct);

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest
        >(ForMira(ctx, ctx.BeerList.Drinks.IdOf(Radler), count: 4));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(0)
            .AssertAsync(ct);
    }

    private static PostBeerCratesForPersonRequest ForMira(
        SeededContext ctx,
        int beerDrinkId,
        int count
    ) =>
        new()
        {
            BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
            PersonId = ctx.Identity.People.IdOf(Drinker),
            BeerDrinkId = beerDrinkId,
            Count = count,
        };

    private Task<SeededContext> BuildWithRadlerAsync(
        DateTimeOffset? radlerRetiredAt,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, CratePrice)
                            .AddBeerDrink(Pot, Radler, RadlerPrice, radlerRetiredAt)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerDelivery(Pot, 3, drink: Radler)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );
}
