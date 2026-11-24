using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerPotDrinkTests : IClassFixture<ApiTestFixture>
{
    private const int RadlerPrice = 12_00;

    private readonly ApiTestFixture _fixture;

    public PostBeerPotDrinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheRetiredDrinkAgainAtTheNewPrice_When_AnOperatorAddsItBack()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(Pot, Warden)
                    .AddBeerDrink(
                        Pot,
                        "Radler",
                        9_00,
                        retiredAt: _fixture.TimeProvider.GetUtcNow().AddDays(-3)
                    ),
            ct
        );

        var (response, result) = await AddAsync(ctx, "Radler", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.BeerList.Drinks.IdOf("Radler"), result.BeerDrinkId);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToListDrinks(
                ("Bier", BeerListSeedBuilder.DefaultCratePriceCents),
                ("Radler", RadlerPrice)
            )
            .BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePotAlreadyListsTheDrink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(beerList => beerList.AddBeerPot(Pot, Warden), ct);

        var (response, _) = await AddAsync(ctx, "bier", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static async Task<(HttpResponseMessage, PostBeerPotDrinkResponse)> AddAsync(
        SeededContext ctx,
        string name,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPotDrink,
            PostBeerPotDrinkRequest,
            PostBeerPotDrinkResponse
        >(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                Name = name,
                CratePriceCents = RadlerPrice,
            }
        );
        return (response, result);
    }

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> beerList,
        CancellationToken ct
    ) => _fixture.BuildAsync(builder => WardenAndDrinker(builder).BeerList(beerList), ct);
}
