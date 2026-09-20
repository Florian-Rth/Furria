using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class GetManageHubTests
{
    private const int TheBootstrapAdminPerson = 1;
    private const int TheAdminRolle = 1;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset InTheZwischenzeit = new(
        2027,
        7,
        1,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetManageHubTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowThePersonenPanelOnly_When_TheCallerOnlyHoldsPersonsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheGruppenPanelOnly_When_TheCallerOnlyHoldsGroupsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.GroupsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Groups);
        Assert.Null(result.Persons);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheRollenPanelOnly_When_TheCallerOnlyHoldsRolesManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.RolesManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Roles);
        Assert.Null(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheSessionseintraegeAndOrtePanels_When_TheCallerOnlyHoldsClubManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.ClubManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Sessions);
        Assert.NotNull(result.Venues);
        Assert.Null(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheSchluesselPanelOnly_When_TheCallerOnlyHoldsKeyHoldingsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.KeyHoldingsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Keys);
        Assert.Null(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheVorstandPanelOnly_When_TheCallerOnlyHoldsBoardManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.BoardManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Board);
        Assert.Null(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
    }

    [Fact]
    public async Task Should_ShowEveryPanel_When_TheBootstrapAdminOpensTheHub()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle").AddSession("laufende", 2026)
                    ),
            ct
        );

        Assert.NotNull(result.Persons);
        Assert.NotNull(result.Groups);
        Assert.NotNull(result.Roles);
        Assert.NotNull(result.Sessions);
        Assert.NotNull(result.Venues);
        Assert.NotNull(result.Keys);
        Assert.NotNull(result.Board);
        Assert.Equal(1, result.Groups.GroupCount);
        Assert.Equal(1, result.Venues.VenueCount);
        Assert.Equal(1, result.Sessions.EntryCount);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoManagementBerechtigung()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("paula").AddMembership("paula-first", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await client.GETAsync<GetManageHub, GetManageHubResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsCalendarManageClub()
    {
        var (response, _) = await AskAsHolderOfAsync(FurriaPermissions.CalendarManageClub);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetManageHub, GetManageHubResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_CountEveryPersonAndTheRunningMitgliedschaften_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                        .AddPerson("bea", "Bea", "Ehemals")
                        .AddMembership("bea-first", "bea", JoinedIn2017, LeftIn2020)
                        .AddPerson("chris", "Chris", "Gast")
                ),
            ct
        );

        Assert.NotNull(result.Persons);
        Assert.Equal(3 + TheBootstrapAdminPerson, result.Persons.PersonCount);
        Assert.Equal(1, result.Persons.MemberCount);
    }

    [Fact]
    public async Task Should_CountActiveAndArchivedGruppen_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde")
                        .AddGroup("kindergarde", "Kindergarde")
                        .AddGroup(
                            "elferrat",
                            "Elferrat",
                            "Aufgeloest.",
                            isRecruiting: false,
                            ArchivedIn2021
                        )
                ),
            ct
        );

        Assert.NotNull(result.Groups);
        Assert.Equal(2, result.Groups.GroupCount);
        Assert.Equal(1, result.Groups.ArchivedCount);
    }

    [Fact]
    public async Task Should_CountActiveRollenAndTheUnbesetzten_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("hanna", "Hanna", "Pflicht"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder("notenwart", "hanna-notenwart", "Notenwart", "hanna")
                            .AddRole("archivar", "Archivar")
                            .AddRole("kassenpruefer", "Kassenpruefer")
                            .AddRoleHolding(
                                "hanna-kassenpruefer",
                                "kassenpruefer",
                                "hanna",
                                JoinedIn2017,
                                _fixture.Today.AddDays(-1)
                            )
                            .AddRoleWithDetails("zeugwart", "Zeugwart", "", ArchivedIn2021)
                    ),
            ct
        );

        Assert.NotNull(result.Roles);
        Assert.Equal(3 + TheAdminRolle, result.Roles.RoleCount);
        Assert.Equal(2, result.Roles.VacantCount);
    }

    [Fact]
    public async Task Should_NameTheRunningSession_When_TheClubHasWrittenItDown()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var result = await ReadTheHubAsAdminAsync(
                    builder =>
                        builder.Club(club =>
                            club.AddSession("vorige", 2025).AddSession("laufende", 2026)
                        ),
                    ct
                );

                Assert.NotNull(result.Sessions);
                Assert.Equal(2, result.Sessions.EntryCount);
                Assert.Equal(2026, result.Sessions.CurrentStartYear);
                Assert.True(result.Sessions.HasCurrentEntry);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheComingSession_When_TheHubIsReadBetweenSessions()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheZwischenzeit,
            async () =>
            {
                var result = await ReadTheHubAsAdminAsync(
                    builder =>
                        builder.Club(club =>
                            club.AddSession("vorige", 2025).AddSession("laufende", 2026)
                        ),
                    ct
                );

                Assert.NotNull(result.Sessions);
                Assert.Equal(2, result.Sessions.EntryCount);
                Assert.Equal(2027, result.Sessions.CurrentStartYear);
                Assert.False(result.Sessions.HasCurrentEntry);
            }
        );
    }

    [Fact]
    public async Task Should_CountActiveAndArchivedOrte_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("sporthalle", "Sporthalle")
                        .AddVenue("lager", "Lager", 2)
                        .AddVenue("altes-heim", "Altes Heim", 3, archivedOn: ArchivedIn2021)
                ),
            ct
        );

        Assert.NotNull(result.Venues);
        Assert.Equal(2, result.Venues.VenueCount);
        Assert.Equal(1, result.Venues.ArchivedCount);
    }

    [Fact]
    public async Task Should_CountRunningSchluesselAndTheirTraeger_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Hausmeister")
                            .AddPerson("nadine", "Nadine", "Zeugwart")
                            .AddPerson("paula", "Paula", "Ehemals")
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddVenue("lager", "Lager", 2)
                            .AddKeyHolding("ilka-sporthalle", "sporthalle", "ilka", JoinedIn2017)
                            .AddKeyHolding("ilka-lager", "lager", "ilka", JoinedIn2017)
                            .AddKeyHolding(
                                "nadine-sporthalle",
                                "sporthalle",
                                "nadine",
                                JoinedIn2017
                            )
                            .AddKeyHolding(
                                "paula-sporthalle",
                                "sporthalle",
                                "paula",
                                JoinedIn2017,
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        Assert.NotNull(result.Keys);
        Assert.Equal(3, result.Keys.HoldingCount);
        Assert.Equal(2, result.Keys.HolderCount);
    }

    [Fact]
    public async Task Should_CountRunningSitzeAndUnbesetzteFunktionen_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("hanna", "Hanna", "Vorsitz"))
                    .Club(club =>
                        club.AddBoardOffice("vorsitz", "Vorsitz")
                            .AddBoardOffice("kassenwart", "Kassenwart", 2)
                            .AddBoardOffice("zeugwart", "Zeugwart", 3, archivedOn: ArchivedIn2021)
                            .AddBoardSeat("hanna-vorsitz", "vorsitz", "hanna", JoinedIn2017)
                            .AddBoardSeat(
                                "hanna-zeugwart",
                                "zeugwart",
                                "hanna",
                                JoinedIn2017,
                                _fixture.Today.AddDays(-1)
                            )
                    ),
            ct
        );

        Assert.NotNull(result.Board);
        Assert.Equal(1, result.Board.SeatCount);
        Assert.Equal(1, result.Board.VacantOfficeCount);
    }

    [Fact]
    public async Task Should_AnswerEveryPanelWithZeroes_When_TheClubHasWrittenNothingDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(_ => { }, ct);

        Assert.NotNull(result.Persons);
        Assert.Equal(TheBootstrapAdminPerson, result.Persons.PersonCount);
        Assert.Equal(0, result.Persons.MemberCount);
        Assert.NotNull(result.Groups);
        Assert.Equal(0, result.Groups.GroupCount);
        Assert.Equal(0, result.Groups.ArchivedCount);
        Assert.NotNull(result.Roles);
        Assert.Equal(TheAdminRolle, result.Roles.RoleCount);
        Assert.Equal(0, result.Roles.VacantCount);
        Assert.NotNull(result.Sessions);
        Assert.Equal(0, result.Sessions.EntryCount);
        Assert.False(result.Sessions.HasCurrentEntry);
        Assert.NotNull(result.Venues);
        Assert.Equal(0, result.Venues.VenueCount);
        Assert.Equal(0, result.Venues.ArchivedCount);
        Assert.NotNull(result.Keys);
        Assert.Equal(0, result.Keys.HoldingCount);
        Assert.Equal(0, result.Keys.HolderCount);
        Assert.NotNull(result.Board);
        Assert.Equal(0, result.Board.SeatCount);
        Assert.Equal(0, result.Board.VacantOfficeCount);
    }

    private async Task<GetManageHubResponse> ReadTheHubAsAdminAsync(
        Action<SeedContextBuilder> arrange,
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(arrange, ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetManageHub, GetManageHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    private async Task<(
        HttpResponseMessage Response,
        GetManageHubResponse Result
    )> AskAsHolderOfAsync(string permissionKey)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "teilpflege",
                            "ilka-teilpflege",
                            "Teilpflege",
                            "ilka",
                            permissionKey
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<GetManageHub, GetManageHubResponse>();

        return (response, result);
    }
}
