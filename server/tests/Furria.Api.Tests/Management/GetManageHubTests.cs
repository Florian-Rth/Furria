using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Api.Tests.ToDos;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class GetManageHubTests
{
    private const int TheUnheldAdminRole = 1;

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

    private static readonly DateTimeOffset InTheMeantime = new(2027, 7, 1, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetManageHubTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowThePersonsPanelOnly_When_TheCallerOnlyHoldsPersonsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Persons);
        Assert.NotNull(result.Accounts);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowTheGroupsPanelOnly_When_TheCallerOnlyHoldsGroupsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.GroupsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Groups);
        Assert.Null(result.Accounts);
        Assert.Null(result.Persons);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowTheRolesPanelOnly_When_TheCallerOnlyHoldsRolesManage()
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
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowTheSessionRecordsAndVenuesPanels_When_TheCallerOnlyHoldsClubManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.ClubManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Sessions);
        Assert.NotNull(result.Venues);
        Assert.NotNull(result.ClubRecord);
        Assert.Null(result.Persons);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
    }

    [Fact]
    public async Task Should_ShowTheKeysPanelOnly_When_TheCallerOnlyHoldsKeyHoldingsManage()
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
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowThePersonsPanelOnly_When_TheCallerOnlyHoldsAccountsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.AccountsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Persons);
        Assert.Null(result.Accounts);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowThePersonsPanelOnly_When_TheCallerOnlyHoldsPersonsDelete()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.PersonsDelete);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Persons);
        Assert.Null(result.Accounts);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowTheBoardPanelOnly_When_TheCallerOnlyHoldsBoardManage()
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
        Assert.Null(result.ClubRecord);
        Assert.Null(result.Applications);
    }

    [Fact]
    public async Task Should_ShowTheApplicationsPanelOnly_When_TheCallerOnlyDecidesApplications()
    {
        var (response, result) = await AskAsHolderOfAsync(
            FurriaPermissions.MembershipApplicationsDecide
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Applications);
        Assert.Null(result.Persons);
        Assert.Null(result.Accounts);
        Assert.Null(result.Groups);
        Assert.Null(result.Roles);
        Assert.Null(result.Sessions);
        Assert.Null(result.Venues);
        Assert.Null(result.Keys);
        Assert.Null(result.Board);
        Assert.Null(result.ClubRecord);
    }

    [Fact]
    public async Task Should_CountTheUndecidedApplicationsAndTheMinorsAmongThem_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication("mia", today.AddYears(-17))
                        .AddMembershipApplication("lena", today.AddYears(-18))
                        .AddMembershipApplication("nora", today.AddYears(-40))
                        .AddMembershipApplication("olga", today.AddYears(-16), unconfirmed: true)
                ),
            ct
        );

        Assert.NotNull(result.Applications);
        Assert.Equal(3, result.Applications.UndecidedCount);
        Assert.Equal(1, result.Applications.MinorCount);
    }

    [Fact]
    public async Task Should_ShowEveryPanel_When_TheManagingLoginOpensTheHub()
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
        Assert.NotNull(result.ClubRecord);
        Assert.NotNull(result.Applications);
        Assert.Equal(1, result.Groups.GroupCount);
        Assert.Equal(1, result.Venues.VenueCount);
        Assert.Equal(1, result.Sessions.EntryCount);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoManagementPermission()
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
    public async Task Should_CountEveryPersonAndTheRunningMemberships_When_TheHubIsRead()
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
        Assert.Equal(3, result.Persons.PersonCount);
        Assert.Equal(1, result.Persons.MemberCount);
    }

    [Fact]
    public async Task Should_LeaveArchivedPersonsOutOfThePersonCount_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Ehemals")
                        .AddMembership("bea-first", "bea", JoinedIn2017, LeftIn2020)
                        .AddPerson("dora", "Dora", "Abgelegt")
                        .AddMembership("dora-first", "dora", JoinedIn2017, LeftIn2020)
                        .AddArchive("dora", ArchivedIn2021)
                ),
            ct
        );

        Assert.NotNull(result.Persons);
        Assert.Equal(1, result.Persons.PersonCount);
    }

    [Fact]
    public async Task Should_CountActiveAndArchivedGroups_When_TheHubIsRead()
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
    public async Task Should_CountActiveRolesAndTheUnfilledOnes_When_TheHubIsRead()
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
        Assert.Equal(3 + TheUnheldAdminRole, result.Roles.RoleCount);
        Assert.Equal(2 + TheUnheldAdminRole, result.Roles.VacantCount);
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
            InTheMeantime,
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
    public async Task Should_CountActiveAndArchivedVenues_When_TheHubIsRead()
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
    public async Task Should_CountRunningKeysAndTheirHolders_When_TheHubIsRead()
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
    public async Task Should_CountRunningSeatsAndUnfilledOffices_When_TheHubIsRead()
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
        Assert.Equal(0, result.Persons.PersonCount);
        Assert.Equal(0, result.Persons.MemberCount);
        Assert.NotNull(result.Groups);
        Assert.Equal(0, result.Groups.GroupCount);
        Assert.Equal(0, result.Groups.ArchivedCount);
        Assert.NotNull(result.Roles);
        Assert.Equal(TheUnheldAdminRole, result.Roles.RoleCount);
        Assert.Equal(TheUnheldAdminRole, result.Roles.VacantCount);
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
        Assert.NotNull(result.Applications);
        Assert.Equal(0, result.Applications.UndecidedCount);
        Assert.Equal(0, result.Applications.MinorCount);
    }

    [Fact]
    public async Task Should_CarryTheClubRecord_When_TheClubHasWrittenIt()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        foundedYear: 1971,
                        street: "Hauptstraße 1",
                        zip: "99706",
                        city: "Großfurra",
                        email: "vorstand@furria.de",
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        Assert.NotNull(result.ClubRecord);
        Assert.Equal("Großfurraer Carnevals Club e.V.", result.ClubRecord.Name);
        Assert.Equal(0, result.ClubRecord.MissingFactCount);
    }

    [Fact]
    public async Task Should_CountEveryFactAsMissing_When_TheClubHasWrittenNoRecord()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(_ => { }, ct);

        Assert.NotNull(result.ClubRecord);
        Assert.Null(result.ClubRecord.Name);
        Assert.Equal(4, result.ClubRecord.MissingFactCount);
    }

    [Fact]
    public async Task Should_CountAnIncompleteAddressAsMissing_When_TheCityIsNotRecorded()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        foundedYear: 1971,
                        street: "Hauptstraße 1",
                        zip: "99706",
                        email: "vorstand@furria.de"
                    )
                ),
            ct
        );

        Assert.NotNull(result.ClubRecord);
        Assert.Equal(1, result.ClubRecord.MissingFactCount);
    }

    [Fact]
    public async Task Should_CountAccessOpenInvitationsAndMissingEmails_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            today
                        )
                        .AddAccount("anna")
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            today
                        )
                        .AddEligiblePerson(
                            "carla",
                            "Carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            today
                        )
                        .AddAccount("carla", disabled: true)
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact(
                            "dora",
                            birthDate: today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("dora-membership", "dora", today.AddYears(-1))
                        .AddPerson("emil", "Emil", "Muster")
                        .AddAccount("emil")
                        .AddEligiblePerson(
                            "fritz",
                            "Fritz",
                            InvitationSteps.UniqueContactEmail("fritz"),
                            today
                        )
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(admin, ctx.Identity.People.IdOf("fritz"));

        var (response, result) = await admin.GETAsync<GetManageHub, GetManageHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.Accounts);
        Assert.Equal(1, result.Accounts.WithAccessCount);
        Assert.Equal(4, result.Accounts.OfCount);
        Assert.Equal(1, result.Accounts.OpenInvitationCount);
        Assert.Equal(1, result.Accounts.EligibleWithoutEmailCount);
    }

    [Fact]
    public async Task Should_CountAnExpiredInvitationAsOpen_When_ItWasNeitherRedeemedNorVoided()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(admin, ctx.Identity.People.IdOf("anna"));

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(20),
            async () =>
            {
                var laterAdmin = await ctx.Identity.ManagingLoginClientAsync(ct);
                var (_, result) = await laterAdmin.GETAsync<GetManageHub, GetManageHubResponse>();

                Assert.NotNull(result.Accounts);
                Assert.Equal(1, result.Accounts.OpenInvitationCount);
            }
        );
    }

    [Fact]
    public async Task Should_CountEachAccessRowAsTheRegisterListsIt_When_EveryAccessCaseIsPresent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessCaseAsync(ct);
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(admin, ctx.Identity.People.IdOf("gina"));

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(20),
            async () =>
            {
                var laterAdmin = await ctx.Identity.ManagingLoginClientAsync(ct);
                await InvitationSteps.InviteAsync(laterAdmin, ctx.Identity.People.IdOf("carla"));
                await InvitationSteps.InviteInPersonAsync(
                    laterAdmin,
                    ctx.Identity.People.IdOf("kai")
                );

                var (_, hub) = await laterAdmin.GETAsync<GetManageHub, GetManageHubResponse>();

                Assert.NotNull(hub.Accounts);
                Assert.Equal(
                    hub.Accounts.WithAccessCount,
                    await CountListedAsync(laterAdmin, PersonAccessFilters.WithAccess)
                );
                Assert.Equal(
                    hub.Accounts.OpenInvitationCount,
                    await CountListedAsync(laterAdmin, PersonAccessFilters.OpenInvitation)
                );
                Assert.Equal(
                    hub.Accounts.EligibleWithoutEmailCount,
                    await CountListedAsync(laterAdmin, PersonAccessFilters.WithoutEmail)
                );
                Assert.Equal(1, hub.Accounts.WithAccessCount);
                Assert.Equal(3, hub.Accounts.OpenInvitationCount);
                Assert.Equal(1, hub.Accounts.EligibleWithoutEmailCount);
            }
        );
    }

    [Fact]
    public async Task Should_ListHerToDosInKindOrder_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                ),
            ct
        );

        Assert.Equal(
            [ToDoKind.NeverInvited, ToDoKind.ClubRecordGap, ToDoKind.ApplicationWaiting],
            result.ToDos.Select(toDo => toDo.Kind)
        );
        Assert.Equal([1, 4, 1], result.ToDos.Select(toDo => toDo.Count));
        Assert.All(result.ToDos, toDo => Assert.False(toDo.IsSeen));
        Assert.All(result.ToDos, toDo => Assert.Equal(0, toDo.NewCount));
        Assert.All(result.ToDos, toDo => Assert.NotEmpty(toDo.Version));
    }

    [Fact]
    public async Task Should_LeaveOutWaitingTicketRequests_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("buergerhaus", "Bürgerhaus")
                        .AddEvent("gala", "1. Prunksitzung", InTheMeantime, "buergerhaus")
                        .AddTicketRequest("mia-gala", "gala", "Mia Gast", "mia@guest.test")
                ),
            ct
        );

        Assert.DoesNotContain(
            ToDoKind.TicketRequestWaiting,
            result.ToDos.Select(toDo => toDo.Kind)
        );
    }

    [Fact]
    public async Task Should_ListNoToDo_When_TheCallerOnlyHoldsGroupsManage()
    {
        var (response, result) = await AskAsHolderOfAsync(FurriaPermissions.GroupsManage);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.ToDos);
    }

    [Fact]
    public async Task Should_CountTheNewItem_When_AKeyJoinsASeenToDo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

        await ToDoSteps.HandOutKeyAsync(
            keyWarden,
            ctx.Club.Venues.IdOf("vereinsheim"),
            ctx.Identity.People.IdOf("hanna"),
            JoinedIn2017
        );

        var toDo = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.True(toDo.IsSeen);
        Assert.Equal(1, toDo.NewCount);
        Assert.Equal(2, toDo.Count);
    }

    [Fact]
    public async Task Should_KeepTheMark_When_AnItemBehindItResolves()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        await ToDoSteps.HandOutKeyAsync(
            keyWarden,
            ctx.Club.Venues.IdOf("vereinsheim"),
            ctx.Identity.People.IdOf("hanna"),
            JoinedIn2017
        );
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

        await ToDoSteps.TakeBackKeyAsync(
            keyWarden,
            ctx.Club.KeyHoldings.IdOf("hanna-sporthalle"),
            _fixture.Today
        );

        var toDo = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.True(toDo.IsSeen);
        Assert.Equal(0, toDo.NewCount);
        Assert.Equal(1, toDo.Count);
    }

    [Fact]
    public async Task Should_SpendTheMark_When_NoneOfItsItemsRemain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);
        await ToDoSteps.TakeBackKeyAsync(
            keyWarden,
            ctx.Club.KeyHoldings.IdOf("hanna-sporthalle"),
            _fixture.Today
        );
        var resolved = await ToDoSteps.ToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);

        await ToDoSteps.HandOutKeyAsync(
            keyWarden,
            ctx.Club.Venues.IdOf("vereinsheim"),
            ctx.Identity.People.IdOf("hanna"),
            JoinedIn2017
        );

        var toDo = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.Null(resolved);
        Assert.False(toDo.IsSeen);
        Assert.Equal(0, toDo.NewCount);
        Assert.Equal(1, toDo.Count);
    }

    private Task<SeededContext> BuildAKeyToTakeBackAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Schlüsselwart")
                            .AddAccount("maik")
                            .AddPerson("hanna", "Hanna", "Ausgetreten")
                            .AddMembership(
                                "hanna-member",
                                "hanna",
                                JoinedIn2017,
                                _fixture.Today.AddDays(-1)
                            )
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schluesselwart",
                            "maik-schluesselwart",
                            "Schlüsselwart",
                            "maik",
                            FurriaPermissions.KeyHoldingsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle Am Ring")
                            .AddVenue("vereinsheim", "Vereinsheim")
                            .AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2017)
                    ),
            ct
        );

    private Task<SeededContext> BuildEveryAccessCaseAsync(CancellationToken ct)
    {
        var today = _fixture.Today;

        return _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            today
                        )
                        .AddAccount("anna")
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            today
                        )
                        .AddAccount("bea", disabled: true)
                        .AddEligiblePerson(
                            "carla",
                            "Carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            today
                        )
                        .AddEligiblePerson(
                            "dora",
                            "Dora",
                            InvitationSteps.UniqueContactEmail("dora"),
                            today
                        )
                        .AddPerson("emil", "Emil", "Muster")
                        .AddPersonContact(
                            "emil",
                            birthDate: today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("emil-membership", "emil", today.AddYears(-1))
                        .AddPerson("fritz", "Fritz", "Muster")
                        .AddPersonContact(
                            "fritz",
                            InvitationSteps.UniqueContactEmail("fritz"),
                            birthDate: today.AddYears(-30)
                        )
                        .AddEligiblePerson(
                            "gina",
                            "Gina",
                            InvitationSteps.UniqueContactEmail("gina"),
                            today
                        )
                        .AddPerson("hans", "Hans", "Muster")
                        .AddPersonContact("hans", InvitationSteps.UniqueContactEmail("hans"))
                        .AddMembership("hans-membership", "hans", today.AddYears(-1))
                        .AddPerson("ida", "Ida", "Muster")
                        .AddPersonContact(
                            "ida",
                            InvitationSteps.UniqueContactEmail("ida"),
                            birthDate: today.AddYears(-10)
                        )
                        .AddMembership("ida-membership", "ida", today.AddYears(-1))
                        .AddPerson("jonas", "Jonas", "Muster")
                        .AddAccount("jonas")
                        .AddEligiblePerson(
                            "kai",
                            "Kai",
                            InvitationSteps.UniqueContactEmail("kai"),
                            today
                        )
                ),
            ct
        );
    }

    private static async Task<int> CountListedAsync(HttpClient client, string access)
    {
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest { Access = access });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result.Persons.Count;
    }

    private async Task<GetManageHubResponse> ReadTheHubAsAdminAsync(
        Action<SeedContextBuilder> arrange,
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(arrange, ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
