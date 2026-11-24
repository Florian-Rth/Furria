using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class GetManageHubTests : IClassFixture<ApiTestFixture>
{
    private const int TheUnheldAdminRole = 1;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

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
        Assert.NotNull(result.Intakes);
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
    public async Task Should_CountTheOpenIntakesAndThoseToReview_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();

        var result = await ReadTheHubAsAdminAsync(
            builder =>
                builder
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Intakes(intakes =>
                        intakes
                            .AddIntake("open", groupAliases: ["tanzgarde"])
                            .AddIntake("also-open", memberFrom: _fixture.Today)
                            .AddIntake(
                                "expired",
                                groupAliases: ["tanzgarde"],
                                expiresAt: now.AddSeconds(-1)
                            )
                            .AddIntake(
                                "review",
                                groupAliases: ["tanzgarde"],
                                submittedName: ("Lena", "Neu")
                            )
                            .AddIntake(
                                "gone",
                                groupAliases: ["tanzgarde"],
                                discardedAt: now.AddHours(-1)
                            )
                    ),
            ct
        );

        Assert.NotNull(result.Intakes);
        Assert.Equal(2, result.Intakes.OpenCount);
        Assert.Equal(1, result.Intakes.NeedsReviewCount);
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
        Assert.NotNull(result.Intakes);
        Assert.Equal(1, result.Groups.GroupCount);
        Assert.Equal(1, result.Venues.VenueCount);
        Assert.Equal(1, result.Sessions.EntryCount);
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
