using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PostBeerPotTests : IClassFixture<ApiTestFixture>
{
    private const int UnknownPersonId = 999_998;
    private const int CratePrice = 14_50;
    private const string PaymentLink = "https://paypal.me/gretageldbeutel";
    private const string PaymentNote = "IBAN DE02 1203 0000 0000 2020 51";

    private readonly ApiTestFixture _fixture;

    public PostBeerPotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenThePot_When_TheOwnerMayManageTheBeerList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => WithWarden(builder), ct);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, result) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(
            new()
            {
                OwnerPersonId = ctx.Identity.People.IdOf("greta"),
                CratePriceCents = CratePrice,
                PaymentLink = $"  {PaymentLink} ",
                PaymentNote = PaymentNote,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.BeerPot(result.BeerPotId)
            .ToBeOwnedBy(ctx.Identity.People.IdOf("greta"))
            .BeerPot(result.BeerPotId)
            .ToHaveSettings(CratePrice, PaymentLink, PaymentNote)
            .BeerPot(result.BeerPotId)
            .ToBeOpenedAt(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_APotIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder).BeerList(beerList => beerList.AddBeerPot("topf", "greta")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(OpenedBy(ctx.Identity.People.IdOf("greta")));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenANewPot_When_ThePreviousPotIsClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .BeerList(beerList =>
                        beerList.AddBeerPot(
                            "alter-topf",
                            "greta",
                            openedAt: now.AddDays(-200),
                            closedAt: now.AddDays(-2)
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(OpenedBy(ctx.Identity.People.IdOf("greta")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(2).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnValidation_When_TheOwnerMayNotManageTheBeerList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .Identity(identity =>
                        identity.AddMembership("paul-first", "paul", new DateOnly(2018, 1, 1))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(OpenedBy(ctx.Identity.People.IdOf("paul")));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOwnerIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => WithWarden(builder), ct);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(OpenedBy(UnknownPersonId));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_NoPaymentDetailIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => WithWarden(builder), ct);

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, _) = await client.POSTAsync<
            PostBeerPot,
            PostBeerPotRequest,
            PostBeerPotResponse
        >(
            new()
            {
                OwnerPersonId = ctx.Identity.People.IdOf("greta"),
                CratePriceCents = CratePrice,
                PaymentLink = " ",
                PaymentNote = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx.Expected.BeerPots().ToHaveCount(0).AssertAsync(ct);
    }

    private static PostBeerPotRequest OpenedBy(int ownerPersonId) =>
        new()
        {
            OwnerPersonId = ownerPersonId,
            CratePriceCents = CratePrice,
            PaymentLink = PaymentLink,
        };

    private static SeedContextBuilder WithWarden(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("greta").AddPerson("paul", "Paul", "Brandt"))
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
