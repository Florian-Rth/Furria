using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupByIdTests
{
    private const int UnknownGroupId = 999_999;
    private const int FoundedIn1971 = 1971;
    private const int TrainingMinutes = 90;

    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly AdminSince2019 = new(2019, 1, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly EndedIn2024 = new(2024, 3, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetGroupByIdResponse>> ReadHubAsync(
        HttpClient client,
        int groupId
    ) =>
        client.GETAsync<GetGroupById, GetGroupByIdRequest, GetGroupByIdResponse>(
            new GetGroupByIdRequest { GroupId = groupId }
        );

    [Fact]
    public async Task Should_CarryTheGroupWithItsPeople_When_AnAffiliatedStrangerReadsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                "Die Garde tanzt seit 1971.",
                                isRecruiting: true
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), result.GroupId);
        Assert.Equal("Tanzgarde", result.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", result.Description);
        Assert.True(result.IsRecruiting);
        Assert.False(result.ViewerIsMember);
        Assert.False(result.ViewerIsAdmin);
        Assert.Null(result.ViewerSince);
        Assert.Empty(result.PastMembers);
        Assert.Empty(result.PastAdmins);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"), paula.GroupMembershipId);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal("Paula", paula.FirstName);
        Assert.Equal("Brendel", paula.LastName);
        Assert.Equal(JoinedIn2017, paula.JoinedOn);
        Assert.Null(paula.LeftOn);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde"), anna.GroupAdminId);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
        Assert.Equal("Anna", anna.FirstName);
        Assert.Equal("Kaiser", anna.LastName);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(AdminSince2019, anna.SinceOn);
        Assert.Null(anna.UntilOn);
        Assert.Equal(AdminSince2019, anna.Since);
    }

    [Fact]
    public async Task Should_CarryTheProfile_When_TheGroupNamesKindYearAndTone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("tanz", "Tanzgruppe")
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                groupKindAlias: "tanz",
                                foundedYear: FoundedIn1971,
                                tone: GroupTone.Iris
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddTrainingSlot(
                                "dienstags",
                                "tanzgarde",
                                DayOfWeek.Tuesday,
                                HalfPastSeven,
                                TrainingMinutes,
                                "sporthalle"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Groups.GroupKinds.IdOf("tanz"), result.GroupKindId);
        Assert.Equal("Tanzgruppe", result.GroupKindName);
        Assert.Equal(FoundedIn1971, result.FoundedYear);
        Assert.Equal(GroupTone.Iris, result.Tone);
        var slot = Assert.Single(result.TrainingSlots);
        Assert.Equal(ctx.Club.TrainingSlots.IdOf("dienstags"), slot.GroupTrainingSlotId);
        Assert.Equal(DayOfWeek.Tuesday, slot.Weekday);
        Assert.Equal(HalfPastSeven, slot.StartsAt);
        Assert.Equal(TrainingMinutes, slot.DurationMinutes);
        Assert.Equal(ctx.Club.Venues.IdOf("sporthalle"), slot.VenueId);
        Assert.Equal("Sporthalle", slot.VenueName);
    }

    [Fact]
    public async Task Should_CarryNoProfile_When_TheGroupNamesNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.GroupKindId);
        Assert.Null(result.GroupKindName);
        Assert.Null(result.FoundedYear);
        Assert.Null(result.Tone);
        Assert.Empty(result.TrainingSlots);
    }

    [Fact]
    public async Task Should_NameHerOwnStanding_When_AMemberReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsMember);
        Assert.False(result.ViewerIsAdmin);
        Assert.Equal(JoinedIn2017, result.ViewerSince);
        Assert.Empty(result.PastMembers);
        Assert.Empty(result.PastAdmins);
    }

    [Fact]
    public async Task Should_ReportHerChainMinimum_When_SheLeftTheGroupAndReturned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                RejoinedIn2023
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-admin-first",
                                "tanzgarde",
                                "anna",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-admin-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(JoinedIn2017, result.ViewerSince);
        var running = Assert.Single(result.Members);
        Assert.Equal(RejoinedIn2023, running.JoinedOn);
        Assert.Equal(JoinedIn2017, running.Since);
        var ended = Assert.Single(result.PastMembers);
        Assert.Equal(JoinedIn2017, ended.JoinedOn);
        Assert.Equal(LeftIn2020, ended.LeftOn);
        Assert.Equal(JoinedIn2017, ended.Since);
        var runningAdmin = Assert.Single(result.Admins);
        Assert.Equal(RejoinedIn2023, runningAdmin.SinceOn);
        Assert.Equal(JoinedIn2017, runningAdmin.Since);
        Assert.Equal("Trainerin", runningAdmin.Function);
        var endedAdmin = Assert.Single(result.PastAdmins);
        Assert.Equal(JoinedIn2017, endedAdmin.SinceOn);
        Assert.Equal(JoinedIn2017, endedAdmin.Since);
    }

    [Fact]
    public async Task Should_CarryTheHistory_When_TheGroupAdminReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                            .AddGroupAdmin(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.False(result.ViewerIsMember);
        Assert.Null(result.ViewerSince);
        Assert.Equal(
            [ctx.Identity.People.IdOf("paula")],
            result.Members.Select(member => member.PersonId)
        );
        Assert.Equal(
            [ctx.Identity.People.IdOf("anna")],
            result.Admins.Select(admin => admin.PersonId)
        );
        var mara = Assert.Single(result.PastMembers);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("mara-tanzgarde"), mara.GroupMembershipId);
        Assert.Equal(ctx.Identity.People.IdOf("mara"), mara.PersonId);
        Assert.Equal("Mara", mara.FirstName);
        Assert.Equal("Lenz", mara.LastName);
        Assert.Equal(JoinedIn2017, mara.JoinedOn);
        Assert.Equal(LeftIn2020, mara.LeftOn);
        Assert.Equal(JoinedIn2017, mara.Since);
        var katrin = Assert.Single(result.PastAdmins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("katrin-tanzgarde"), katrin.GroupAdminId);
        Assert.Equal(ctx.Identity.People.IdOf("katrin"), katrin.PersonId);
        Assert.Equal("Betreuerin", katrin.Function);
        Assert.Equal(JoinedIn2017, katrin.SinceOn);
        Assert.Equal(LeftIn2020, katrin.UntilOn);
        Assert.Equal(JoinedIn2017, katrin.Since);
    }

    [Fact]
    public async Task Should_ListTheHistoryNewestFirst_When_TheGroupAdminReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                RejoinedIn2023,
                                EndedIn2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Groups.GroupMemberships.IdOf("mara-tanzgarde"),
                ctx.Groups.GroupMemberships.IdOf("katrin-tanzgarde"),
            ],
            result.PastMembers.Select(member => member.GroupMembershipId)
        );
    }

    [Fact]
    public async Task Should_WithholdTheHistory_When_APlainMemberReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.ViewerIsAdmin);
        Assert.Empty(result.PastMembers);
        Assert.Empty(result.PastAdmins);
    }

    [Fact]
    public async Task Should_CarryTheFunctionOfTheRunningRow_When_TheGroupAdminWasRenewed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var anna = Assert.Single(result.Admins);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(JoinedIn2017, anna.Since);
    }

    [Fact]
    public async Task Should_CarryNoFunction_When_TheGroupAdminRowNamesNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var anna = Assert.Single(result.Admins);
        Assert.Null(anna.Function);
    }

    [Fact]
    public async Task Should_OmitTheRow_When_ItLiesAhead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("nina", "Nina", "Orth")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                            .AddGroupMembership("nina-tanzgarde", "tanzgarde", "nina", JoinsIn2030)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.Empty(result.Members);
        Assert.Empty(result.PastMembers);
    }

    [Fact]
    public async Task Should_SortTheRunningRowsAsGerman_When_TheGroupHasSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("bohn", "Elke", "Bohn")
                            .AddPerson("boehme", "Doris", "Böhme")
                            .AddPerson("aetzold", "Carla", "Ätzold")
                            .AddPerson("ahrens", "Berta", "Ahrens")
                            .AddPerson("zimmermann", "Hanna", "Zimmermann")
                            .AddPerson("lohse", "Gerda", "Lohse")
                            .AddPerson("loeffler", "Frieda", "Löffler")
                            .AddAccount("ahrens")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bohn-tanzgarde", "tanzgarde", "bohn")
                            .AddGroupMembership("boehme-tanzgarde", "tanzgarde", "boehme")
                            .AddGroupMembership("aetzold-tanzgarde", "tanzgarde", "aetzold")
                            .AddGroupMembership("ahrens-tanzgarde", "tanzgarde", "ahrens")
                            .AddGroupAdmin("zimmermann-tanzgarde", "tanzgarde", "zimmermann")
                            .AddGroupAdmin("lohse-tanzgarde", "tanzgarde", "lohse")
                            .AddGroupAdmin("loeffler-tanzgarde", "tanzgarde", "loeffler")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ahrens", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ahrens", "Ätzold", "Böhme", "Bohn"],
            result.Members.Select(member => member.LastName)
        );
        Assert.Equal(
            ["Löffler", "Lohse", "Zimmermann"],
            result.Admins.Select(admin => admin.LastName)
        );
    }

    [Fact]
    public async Task Should_NameBothRows_When_SheLeftTodayAndRejoinedToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                today
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-second",
                                "tanzgarde",
                                "paula",
                                today
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                "Betreuerin",
                                JoinedIn2017,
                                today
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                today
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde-first"),
                ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde-second"),
            ],
            result.Members.Select(member => member.GroupMembershipId)
        );
        Assert.All(result.Members, member => Assert.Equal(JoinedIn2017, member.Since));
        Assert.Equal(
            [
                ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde-first"),
                ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde-second"),
            ],
            result.Admins.Select(admin => admin.GroupAdminId)
        );
        Assert.All(result.Admins, admin => Assert.Equal(JoinedIn2017, admin.Since));
        Assert.Equal(["Betreuerin", "Trainerin"], result.Admins.Select(admin => admin.Function));
    }

    [Fact]
    public async Task Should_SayTheRowIsNotAffiliated_When_ThePersonIsAffiliatedByNothingElse()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(Assert.Single(result.Members).IsAffiliated);
        Assert.False(Assert.Single(result.Admins).IsAffiliated);
    }

    [Fact]
    public async Task Should_ReturnTheHub_When_TheCallerOnlyAdministersTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("trainerin", "Tanja", "Weber")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddAccount("trainerin")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "trainerin-kindergarde",
                                "kindergarde",
                                "trainerin",
                                "Trainerin"
                            )
                            .AddGroupMembership(
                                "katrin-kindergarde",
                                "kindergarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("trainerin", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.True(result.ViewerMayManage);
        Assert.False(result.ViewerIsMember);
        Assert.Null(result.ViewerSince);
        Assert.Equal(
            [ctx.Identity.People.IdOf("katrin")],
            result.PastMembers.Select(member => member.PersonId)
        );
    }

    [Fact]
    public async Task Should_ReturnTheHubWithItsHistory_When_TheCallerOnlyHoldsGroupManagement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddAccount("ilka")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.ViewerIsAdmin);
        Assert.True(result.ViewerMayManage);
        Assert.False(result.ViewerIsMember);
        Assert.Equal(
            [ctx.Identity.People.IdOf("katrin")],
            result.PastMembers.Select(member => member.PersonId)
        );
    }

    [Fact]
    public async Task Should_ReturnTheHub_When_TheCallerBelongsToAnotherGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mara"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("mara-elferrat", "elferrat", "mara", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.ViewerIsMember);
        Assert.False(result.ViewerIsAdmin);
        Assert.False(result.ViewerMayManage);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("tom"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_HerGroupMembershipHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mara"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AStrangerAsksForAnUnknownGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("tom")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await ReadHubAsync(client, UnknownGroupId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde", archivedOn: ArchivedIn2021)
                            .AddGroupMembership(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await ReadHubAsync(client, UnknownGroupId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await ReadHubAsync(
            _fixture.CreateClient(),
            ctx.Groups.Groups.IdOf("tanzgarde")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheGroupIdIsNotPositive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await ReadHubAsync(client, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("tanz", "Tanzgruppe")
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                "Die Garde tanzt seit 1971.",
                                groupKindAlias: "tanz",
                                foundedYear: FoundedIn1971,
                                tone: GroupTone.Iris
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara", JoinedIn2017)
                            .AddGroupMembership(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddTrainingSlot(
                                "dienstags",
                                "tanzgarde",
                                DayOfWeek.Tuesday,
                                HalfPastSeven,
                                TrainingMinutes,
                                "sporthalle"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var payload = await client.GetStringAsync(
            $"/api/groups/{ctx.Groups.Groups.IdOf("tanzgarde")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            [
                "groupId",
                "name",
                "description",
                "isRecruiting",
                "groupKindId",
                "groupKindName",
                "foundedYear",
                "tone",
                "trainingSlots",
                "admins",
                "members",
                "viewerIsMember",
                "viewerIsAdmin",
                "viewerMayManage",
                "viewerSince",
                "pastMembers",
                "pastAdmins",
            ],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("iris", document.RootElement.GetProperty("tone").GetString());
        Assert.Equal(JsonValueKind.Null, document.RootElement.GetProperty("viewerSince").ValueKind);
        var slot = document.RootElement.GetProperty("trainingSlots").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupTrainingSlotId",
                "weekday",
                "startsAt",
                "durationMinutes",
                "venueId",
                "venueName",
            ],
            slot.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("tuesday", slot.GetProperty("weekday").GetString());
        Assert.Equal("19:30:00", slot.GetProperty("startsAt").GetString());
        var mara = document.RootElement.GetProperty("members").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupMembershipId",
                "personId",
                "firstName",
                "lastName",
                "joinedOn",
                "leftOn",
                "since",
                "isAffiliated",
            ],
            mara.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("2017-09-01", mara.GetProperty("joinedOn").GetString());
        Assert.Equal(JsonValueKind.Null, mara.GetProperty("leftOn").ValueKind);
        var anna = document.RootElement.GetProperty("admins").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupAdminId",
                "personId",
                "firstName",
                "lastName",
                "function",
                "sinceOn",
                "untilOn",
                "since",
                "isAffiliated",
            ],
            anna.EnumerateObject().Select(field => field.Name)
        );
        var katrin = document.RootElement.GetProperty("pastMembers").EnumerateArray().Single();
        Assert.Equal("2020-03-01", katrin.GetProperty("leftOn").GetString());
        Assert.Empty(document.RootElement.GetProperty("pastAdmins").EnumerateArray());
    }
}
