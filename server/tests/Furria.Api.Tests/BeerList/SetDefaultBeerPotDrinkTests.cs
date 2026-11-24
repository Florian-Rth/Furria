using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class SetDefaultBeerPotDrinkTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public SetDefaultBeerPotDrinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MakeTheDrinkTheOnlyDefault_When_AnOperatorMarksIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerPot(Pot, Warden).AddBeerDrink(Pot, "Radler"),
            ct
        );

        var response = await SetDefaultAsync(ctx, Pot, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink("Radler")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflictAndKeepTheDefault_When_TheDrinkIsRetired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(Pot, Warden)
                    .AddBeerDrink(
                        Pot,
                        "Radler",
                        retiredAt: _fixture.TimeProvider.GetUtcNow().AddDays(-1)
                    ),
            ct
        );

        var response = await SetDefaultAsync(ctx, Pot, ctx.BeerList.Drinks.IdOf("Radler"), ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToHaveDefaultDrink(BeerListSeedBuilder.DefaultDrink)
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> SetDefaultAsync(
        SeededContext ctx,
        string potAlias,
        int beerDrinkId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(Warden, ct);
        return await client.POSTAsync<SetDefaultBeerPotDrink, SetDefaultBeerPotDrinkRequest>(
            new() { BeerPotId = ctx.BeerList.Pots.IdOf(potAlias), BeerDrinkId = beerDrinkId }
        );
    }

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> beerList,
        CancellationToken ct
    ) => _fixture.BuildAsync(builder => WardenAndDrinker(builder).BeerList(beerList), ct);
}
