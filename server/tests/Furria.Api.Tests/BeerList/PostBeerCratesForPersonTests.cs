using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerCratesForPersonTests : IClassFixture<ApiTestFixture>
{
    private const int UnknownPersonId = 999_995;
    private const int UnknownPotId = 999_992;
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
    public async Task Should_RefuseTheBooking_When_TheStockWouldFallBelowZero()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 4)
                            .AddBeerListEnrollment("mira-bier", Drinker)
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
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Count = 5,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.BeerStockOfPot(ctx.BeerList.Pots.IdOf(Pot)).ToStandAt(4).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotHasBeenHandedOver()
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
                BeerPotId = ctx.BeerList.Pots.IdOf("alter-topf"),
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Count = 1,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot(Pot, Warden).AddBeerDelivery(Pot, 10)
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
                PersonId = UnknownPersonId,
                Count = 1,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList => beerList.AddBeerListEnrollment("mira-bier", Drinker)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var response = await client.POSTAsync<
            PostBeerCratesForPerson,
            PostBeerCratesForPersonRequest
        >(
            new()
            {
                BeerPotId = UnknownPotId,
                PersonId = ctx.Identity.People.IdOf(Drinker),
                Count = 1,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
