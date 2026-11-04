using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetMyBeerTabTests : IClassFixture<ApiTestFixture>
{
    private const string FormerWarden = "otto";
    private const string OtherDrinker = "jonas";
    private const string OldPaymentNote = "Bar bei Otto";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetMyBeerTabTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowHerTakenCratesPerPotWithTheOwnersPaymentDetails_When_SheIsEnrolled()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity.AddPerson(FormerWarden, "Otto", "Ott").AddPerson(OtherDrinker)
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                FormerWarden,
                                OldPrice,
                                paymentLink: null,
                                paymentNote: OldPaymentNote,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, Price, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates("alter-topf", Drinker, 2, now.AddDays(-50))
                            .AddBeerCrate("montag", Pot, Drinker, now.AddDays(-9))
                            .AddBeerCrate(
                                "von-greta",
                                Pot,
                                Drinker,
                                now.AddDays(-2),
                                enteredByAlias: Warden
                            )
                            .AddBeerCrate(
                                "zurueck",
                                Pot,
                                Drinker,
                                now.AddDays(-1),
                                undoneAt: now.AddDays(-1)
                            )
                            .AddBeerCrates(Pot, OtherDrinker, 4)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, result) = await client.GETAsync<GetMyBeerTab, GetMyBeerTabResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.BeerList.Pots.IdOf(Pot), ctx.BeerList.Pots.IdOf("alter-topf")],
            result.Pots.Select(pot => pot.BeerPotId)
        );
        var open = result.Pots[0];
        Assert.True(open.IsOpen);
        Assert.Equal(ctx.Identity.People.IdOf(Warden), open.Owner?.PersonId);
        Assert.Equal(BeerListSeedBuilder.DefaultPaymentLink, open.PaymentLink);
        Assert.Equal((2, 2 * Price), (open.OpenCrates, open.OpenCents));
        Assert.Equal(
            [ctx.BeerList.Crates.IdOf("von-greta"), ctx.BeerList.Crates.IdOf("montag")],
            open.Crates.Select(crate => crate.CrateId)
        );
        Assert.Equal(ctx.Identity.People.IdOf(Warden), open.Crates[0].EnteredBy?.PersonId);
        Assert.All(open.Crates, crate => Assert.False(crate.IsPaid));
        var closed = result.Pots[1];
        Assert.False(closed.IsOpen);
        Assert.Equal("Otto", closed.Owner?.FirstName);
        Assert.Equal(OldPaymentNote, closed.PaymentNote);
        Assert.Equal((2, 2 * OldPrice), (closed.OpenCrates, closed.OpenCents));
    }

    [Fact]
    public async Task Should_ShowHerOpenTab_When_HerEnrollmentHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment(
                                "mira-bier",
                                Drinker,
                                now.AddDays(-30),
                                now.AddDays(-3)
                            )
                            .AddBeerCrates(Pot, Drinker, 3, now.AddDays(-10))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, result) = await client.GETAsync<GetMyBeerTab, GetMyBeerTabResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(3, Assert.Single(result.Pots).OpenCrates);
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
