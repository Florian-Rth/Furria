using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerTabsTests : IClassFixture<ApiTestFixture>
{
    private const string FormerDrinker = "anna";
    private const string Abstainer = "zoe";
    private const string OtherPotDrinker = "jonas";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetBeerTabsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryoneWithCratesInThePotWithOpenPaidAndStandingPayments_When_AnOperatorReads()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity
                            .AddPerson(FormerDrinker, "Anna", "Albers")
                            .AddPerson(Abstainer, "Zoe", "Zander")
                            .AddPerson(OtherPotDrinker, "Jonas", "Jung")
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                Warden,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, Price, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerListEnrollment(
                                "anna-bier",
                                FormerDrinker,
                                now.AddDays(-30),
                                now.AddDays(-5)
                            )
                            .AddBeerListEnrollment("zoe-bier", Abstainer)
                            .AddBeerListEnrollment("jonas-bier", OtherPotDrinker)
                            .AddBeerCrate(
                                "mira-alt",
                                Pot,
                                Drinker,
                                now.AddDays(-20),
                                priceCents: OldPrice
                            )
                            .AddBeerCrate("mira-mitte", Pot, Drinker, now.AddDays(-12))
                            .AddBeerCrate("mira-neu", Pot, Drinker, now.AddDays(-3))
                            .AddBeerPayment("mira-bar", Pot, Drinker, 1, now.AddDays(-15), Warden)
                            .AddBeerPayment(
                                "mira-vertippt",
                                Pot,
                                Drinker,
                                2,
                                now.AddDays(-2),
                                undoneAt: now.AddDays(-2)
                            )
                            .AddBeerCrates(Pot, FormerDrinker, 2, now.AddDays(-9))
                            .AddBeerPayment("anna-bar", Pot, FormerDrinker, 2, now.AddDays(-6))
                            .AddBeerCrate(
                                "zoe-zurueck",
                                Pot,
                                Abstainer,
                                now.AddDays(-1),
                                undoneAt: now.AddDays(-1)
                            )
                            .AddBeerCrates("alter-topf", OtherPotDrinker, 4, now.AddDays(-60))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.GETAsync<
            GetBeerTabs,
            GetBeerTabsRequest,
            GetBeerTabsResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf(Pot) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(["Anna", "Mira"], result.Tabs.Select(tab => tab.Person.FirstName));
        var anna = result.Tabs[0];
        Assert.False(anna.IsEnrolled);
        Assert.Equal(
            (0, 0, 2, 2 * Price),
            (anna.OpenCrates, anna.OpenCents, anna.PaidCrates, anna.PaidCents)
        );
        Assert.Null(anna.OldestOpenBookedAt);
        var mira = result.Tabs[1];
        Assert.True(mira.IsEnrolled);
        Assert.Equal(
            (2, Price + Price, 1, OldPrice),
            (mira.OpenCrates, mira.OpenCents, mira.PaidCrates, mira.PaidCents)
        );
        Assert.Equal(now.AddDays(-12), mira.OldestOpenBookedAt);
        var payment = Assert.Single(mira.Payments);
        Assert.Equal(ctx.BeerList.Payments.IdOf("mira-bar"), payment.BeerPaymentId);
        Assert.Equal(
            (1, OldPrice, now.AddDays(-15)),
            (payment.Crates, payment.AmountCents, payment.BookedAt)
        );
        Assert.Equal(ctx.Identity.People.IdOf(Warden), payment.BookedBy?.PersonId);
    }
}
