using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetMyBeerTabTests : IClassFixture<ApiTestFixture>
{
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetMyBeerTabTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SplitHerTabIntoOpenAndPaid_When_AnOperatorBookedHerPayment()
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
                            .AddBeerCrate(
                                "alt",
                                Pot,
                                Drinker,
                                now.AddDays(-20),
                                priceCents: OldPrice
                            )
                            .AddBeerCrate("mitte", Pot, Drinker, now.AddDays(-10))
                            .AddBeerCrate("neu", Pot, Drinker, now.AddDays(-2))
                            .AddBeerPayment(
                                "bar",
                                Pot,
                                Drinker,
                                2,
                                now.AddDays(-1),
                                bookedByAlias: Warden
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, result) = await client.GETAsync<GetMyBeerTab, GetMyBeerTabResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pot = Assert.Single(result.Pots);
        Assert.Equal((1, Price), (pot.OpenCrates, pot.OpenCents));
        Assert.Equal((2, OldPrice + Price), (pot.PaidCrates, pot.PaidCents));
        Assert.Equal(
            [null, now.AddDays(-1), now.AddDays(-1)],
            pot.Crates.Select(crate => crate.PaidAt)
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_SheIsNeitherEnrolledNorOwesACrate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder).BeerList(beerList => beerList.AddBeerPot(Pot, Warden)),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, _) = await client.GETAsync<GetMyBeerTab, GetMyBeerTabResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
