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
    public async Task Should_ListRunningVenuesInGermanNameOrderBeforeArchivedOnes_When_TheKeyScreenIsRead()
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
    public async Task Should_CarryTheVenueWithoutKey_When_NobodyHoldsOne()
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
    public async Task Should_KeepTheReturnedKey_When_ItHasLongEnded()
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
    public async Task Should_ListOpenKeysBeforeReturnedOnes_When_AVenueHasBoth()
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
    public async Task Should_MarkTheArchivedVenueAndKeepItsHistory_When_ItIsOffTheList()
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
    public async Task Should_MarkTheHolderActive_When_SheHoldsARunningMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Perlberg")
                            .AddMembership("maik-membership", "maik", today.AddYears(-1))
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var holding = await ReadHoldingAsync(client, ctx.Club.KeyHoldings.IdOf("maik-lager"));

        Assert.True(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderInactive_When_HerLastTieEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var yesterday = today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Perlberg")
                            .AddMembership("maik-membership", "maik", today.AddYears(-3), yesterday)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("maennerballett", "Männerballett")
                            .AddGroupMembership(
                                "maik-maennerballett",
                                "maennerballett",
                                "maik",
                                today.AddYears(-3),
                                yesterday
                            )
                            .AddGroupAdmin(
                                "maik-maennerballett-admin",
                                "maennerballett",
                                "maik",
                                "Trainer",
                                today.AddYears(-2),
                                yesterday
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat(
                                "maik-kassenwart",
                                "kassenwart",
                                "maik",
                                today.AddYears(-2),
                                yesterday
                            )
                            .AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var holding = await ReadHoldingAsync(client, ctx.Club.KeyHoldings.IdOf("maik-lager"));

        Assert.False(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderActive_When_SheOnlyAdministersAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("sabine", "Sabine", "Rothe"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                "Trainerin",
                                today.AddYears(-1)
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddKeyHolding(
                                "sabine-sporthalle",
                                "sporthalle",
                                "sabine",
                                HeldSince2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var holding = await ReadHoldingAsync(
            client,
            ctx.Club.KeyHoldings.IdOf("sabine-sporthalle")
        );

        Assert.True(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderActive_When_SheOnlyHoldsABoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("frank", "Frank", "Heller"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat(
                                "frank-praesident",
                                "praesident",
                                "frank",
                                today.AddYears(-1)
                            )
                            .AddVenue("vereinsraum", "Vereinsraum")
                            .AddKeyHolding(
                                "frank-vereinsraum",
                                "vereinsraum",
                                "frank",
                                HeldSince2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var holding = await ReadHoldingAsync(
            client,
            ctx.Club.KeyHoldings.IdOf("frank-vereinsraum")
        );

        Assert.True(holding.HolderIsActiveInClub);
    }

    [Fact]
    public async Task Should_MarkTheHolderInactive_When_SheOnlyAdministersAnArchivedGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("sabine", "Sabine", "Rothe"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde", archivedOn: today.AddDays(-1))
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                "Trainerin",
                                today.AddYears(-1)
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddKeyHolding(
                                "sabine-sporthalle",
                                "sporthalle",
                                "sabine",
                                HeldSince2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var holding = await ReadHoldingAsync(
            client,
            ctx.Club.KeyHoldings.IdOf("sabine-sporthalle")
        );

        Assert.False(holding.HolderIsActiveInClub);
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

    private static async Task<KeyHoldingSummaryDto> ReadHoldingAsync(
        HttpClient client,
        int keyHoldingId
    )
    {
        var (response, result) = await client.GETAsync<GetKeyHoldings, GetKeyHoldingsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result
            .Venues.SelectMany(venue => venue.Holdings)
            .Single(holding => holding.KeyHoldingId == keyHoldingId);
    }
}
