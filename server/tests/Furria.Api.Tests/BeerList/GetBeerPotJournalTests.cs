using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerPotJournalTests : IClassFixture<ApiTestFixture>
{
    private const string Cider = "Äppler";

    private readonly ApiTestFixture _fixture;

    public GetBeerPotJournalTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SplitAPaymentIntoTheDrinksItSettledSortedByName_When_ItCoveredSeveralDrinks()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDrink(Pot, Cider)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrate("bier", Pot, Drinker, now.AddDays(-9))
                            .AddBeerCrate("cider-alt", Pot, Drinker, now.AddDays(-8), drink: Cider)
                            .AddBeerCrate("cider-neu", Pot, Drinker, now.AddDays(-7), drink: Cider)
                            .AddBeerPayment("bar", Pot, Drinker, 3, now.AddDays(-1))
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
        var payment = Assert.Single(result.Payments);
        Assert.Equal(
            [(ctx.BeerList.Drinks.IdOf(Cider), Cider, 2), (BeerOf(ctx), "Bier", 1)],
            payment.Drinks.Select(drink => (drink.BeerDrinkId, drink.Name, drink.Crates))
        );
    }
}
