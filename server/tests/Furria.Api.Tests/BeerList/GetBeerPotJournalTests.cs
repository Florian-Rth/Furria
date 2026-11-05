using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerPotJournalTests : IClassFixture<ApiTestFixture>
{
    private const string OtherPot = "alter-topf";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetBeerPotJournalTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryCrateAndPaymentOfThePotNewestFirstIncludingUndoneOnes_When_AnOperatorReads()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                OtherPot,
                                Warden,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, Price, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate(
                                "alt",
                                Pot,
                                Drinker,
                                now.AddDays(-20),
                                priceCents: OldPrice
                            )
                            .AddBeerCrate("neu", Pot, Drinker, now.AddDays(-3), Warden)
                            .AddBeerCrate(
                                "zurueck",
                                Pot,
                                Drinker,
                                now.AddDays(-2),
                                undoneAt: now.AddDays(-2)
                            )
                            .AddBeerCrate("fremd", OtherPot, Drinker, now.AddDays(-60))
                            .AddBeerPayment("bar", Pot, Drinker, 1, now.AddDays(-15), Warden)
                            .AddBeerPayment(
                                "vertippt",
                                Pot,
                                Drinker,
                                1,
                                now.AddDays(-1),
                                undoneAt: now.AddDays(-1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.GETAsync<
            GetBeerPotJournal,
            GetBeerPotJournalRequest,
            GetBeerPotJournalResponse
        >(new() { BeerPotId = ctx.BeerList.Pots.IdOf(Pot) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.BeerList.Crates.IdOf("zurueck"),
                ctx.BeerList.Crates.IdOf("neu"),
                ctx.BeerList.Crates.IdOf("alt"),
            ],
            result.Crates.Select(crate => crate.CrateId)
        );
        Assert.Equal(now.AddDays(-2), result.Crates[0].UndoneAt);
        var entered = result.Crates[1];
        Assert.Equal(
            (Price, now.AddDays(-3), ctx.Identity.People.IdOf(Warden)),
            (entered.PriceCents, entered.BookedAt, entered.EnteredBy?.PersonId)
        );
        Assert.Equal(ctx.Identity.People.IdOf(Drinker), entered.Person?.PersonId);
        Assert.Null(entered.BeerPaymentId);
        Assert.Equal(ctx.BeerList.Payments.IdOf("bar"), result.Crates[2].BeerPaymentId);
        Assert.Equal(
            [ctx.BeerList.Payments.IdOf("vertippt"), ctx.BeerList.Payments.IdOf("bar")],
            result.Payments.Select(payment => payment.BeerPaymentId)
        );
        Assert.Equal(now.AddDays(-1), result.Payments[0].UndoneAt);
        var standing = result.Payments[1];
        Assert.Equal(
            (1, OldPrice, now.AddDays(-15), ctx.Identity.People.IdOf(Warden)),
            (standing.Crates, standing.AmountCents, standing.BookedAt, standing.BookedBy?.PersonId)
        );
        Assert.Null(standing.UndoneAt);
        Assert.Equal(ctx.Identity.People.IdOf(Drinker), standing.Person?.PersonId);
    }
}
