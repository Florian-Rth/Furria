using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PutBeerPotTests : IClassFixture<ApiTestFixture>
{
    private const int UnknownPotId = 999_997;
    private const int RaisedCratePrice = 16_00;
    private const string PaymentNote = "Bar bei Greta oder IBAN DE02 1203 0000 0000 2020 51";

    private readonly ApiTestFixture _fixture;

    public PutBeerPotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SaveTheSettings_When_AnOperatorChangesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder).BeerList(beerList => beerList.AddBeerPot("topf", "greta")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.PUTAsync<PutBeerPot, PutBeerPotRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf("topf"),
                CratePriceCents = RaisedCratePrice,
                PaymentLink = "",
                PaymentNote = PaymentNote,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveSettings(RaisedCratePrice, null, PaymentNote)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheLinkIsNoPayPalLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder).BeerList(beerList => beerList.AddBeerPot("topf", "greta")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.PUTAsync<PutBeerPot, PutBeerPotRequest>(
            new()
            {
                BeerPotId = ctx.BeerList.Pots.IdOf("topf"),
                CratePriceCents = RaisedCratePrice,
                PaymentLink = "https://example.com/zahlen",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.BeerPot(ctx.BeerList.Pots.IdOf("topf"))
            .ToHaveSettings(
                BeerListSeedBuilder.DefaultCratePriceCents,
                BeerListSeedBuilder.DefaultPaymentLink,
                null
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePotIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => WithWarden(builder), ct);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.PUTAsync<PutBeerPot, PutBeerPotRequest>(
            new()
            {
                BeerPotId = UnknownPotId,
                CratePriceCents = RaisedCratePrice,
                PaymentNote = PaymentNote,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static SeedContextBuilder WithWarden(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("greta"))
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "getraenkewart",
                    "greta-getraenkewart",
                    "Getränkewart",
                    "greta",
                    FurriaPermissions.BeerListManage
                )
            );
}
