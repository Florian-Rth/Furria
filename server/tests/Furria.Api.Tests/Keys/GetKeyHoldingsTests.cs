using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Keys;

[Collection("Api")]
public sealed class GetKeyHoldingsTests
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HeldSince2019 = new(2019, 2, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);
    private static readonly DateOnly ReturnedIn2022 = new(2022, 6, 30);

    private readonly ApiTestFixture _fixture;

    public GetKeyHoldingsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListRunningOrteInGermanNameOrderBeforeArchivedOnes_When_TheSchluesselScreenIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("halle", "Turnhalle")
                        .AddVenue("magazin", "Ölmagazin")
                        .AddVenue("lager", "Requisitenlager")
                        .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string[] inOrder = ["Ölmagazin", "Requisitenlager", "Turnhalle", "Altes Lager"];
        Assert.Equal(inOrder, result.Venues.Select(venue => venue.Name));
    }

    [Fact]
    public async Task Should_CarryTheOrtWithoutSchluessel_When_NiemandEinenHat()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(Assert.Single(result.Venues).Holdings);
    }

    [Fact]
    public async Task Should_KeepTheZurueckgenommenenSchluessel_When_ErLaengstBeendetIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding(
                                "maik-lager",
                                "lager",
                                "maik",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var holding = Assert.Single(Assert.Single(result.Venues).Holdings);
        Assert.Equal(ctx.Club.KeyHoldings.IdOf("maik-lager"), holding.KeyHoldingId);
        Assert.Equal(ctx.Identity.People.IdOf("maik"), holding.PersonId);
        Assert.Equal("Perlberg", holding.LastName);
        Assert.Equal(HeldSince2019, holding.SinceOn);
        Assert.Equal(ReturnedIn2022, holding.UntilOn);
    }

    [Fact]
    public async Task Should_ListOffeneSchluesselVorZurueckgenommenen_When_EinOrtBeidesKennt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Perlberg")
                            .AddPerson("anna", "Anna", "Kaiser")
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding(
                                "maik-lager",
                                "lager",
                                "maik",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                            .AddKeyHolding("anna-lager", "lager", "anna", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        int[] inOrder =
        [
            ctx.Club.KeyHoldings.IdOf("anna-lager"),
            ctx.Club.KeyHoldings.IdOf("maik-lager"),
        ];
        Assert.Equal(
            inOrder,
            Assert.Single(result.Venues).Holdings.Select(holding => holding.KeyHoldingId)
        );
    }

    [Fact]
    public async Task Should_MarkTheArchivedOrtAndKeepSeineHistorie_When_ErAusDemVerzeichnisIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                            .AddKeyHolding(
                                "maik-altes-lager",
                                "altes-lager",
                                "maik",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var venue = Assert.Single(result.Venues);
        Assert.Equal(ArchivedIn2021, venue.ArchivedOn);
        Assert.Equal(
            ctx.Club.KeyHoldings.IdOf("maik-altes-lager"),
            Assert.Single(venue.Holdings).KeyHoldingId
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldKeyHoldingsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "ortspflege",
                            "ortspflege-holding",
                            "Ortspflege",
                            "anna",
                            FurriaPermissions.ClubManage
                        )
                    )
                    .Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("halle", "Turnhalle")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
