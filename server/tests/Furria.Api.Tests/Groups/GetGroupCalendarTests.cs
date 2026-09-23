using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupCalendarTests
{
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string GalaSession = "Prunksitzung";
    private const string ChildrensRehearsal = "Probe der Kindergarde";
    private const string Parade = "Rosenmontagsumzug";
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly WindowStart = new(2027, 1, 1);
    private static readonly DateOnly WindowEnd = new(2027, 3, 1);
    private static readonly DateOnly TheTrainingDay = new(2027, 1, 18);

    private static readonly DateTimeOffset AtTheTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheGalaSession = new(
        2027,
        2,
        6,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheChildrensRehearsal = new(
        2027,
        1,
        22,
        16,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheParade = new(2027, 2, 10, 11, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGroupCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryItsOwnAndParticipatingEntries_When_TheCallerIsInTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Equal(new[] { DanceGuardTraining, GalaSession }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_CarryTheCalendar_When_TheCallerOnlyAdministersTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "chris", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Equal(new[] { DanceGuardTraining, GalaSession }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_CarryTheCalendar_When_TheCallerHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "ilka", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Contains(GalaSession, TitlesOf(result));
    }

    [Fact]
    public async Task Should_LeaveOutAnotherGroupsInternalEntry_When_TheGroupOnlyParticipates()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.DoesNotContain(ChildrensRehearsal, TitlesOf(result));
    }

    [Fact]
    public async Task Should_LeaveOutTheClubEntry_When_TheGroupDoesNotParticipate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.DoesNotContain(Parade, TitlesOf(result));
    }

    [Fact]
    public async Task Should_NameTheParticipatingGroup_When_TheEntryCarriesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        var galaSession = result.Entries.Single(entry => entry.Title == GalaSession);
        var participant = Assert.Single(galaSession.ParticipatingGroups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), participant.GroupId);
        Assert.Equal("Tanzgarde", participant.Name);
    }

    [Fact]
    public async Task Should_NarrowTheResults_When_AWindowIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var result = await ReadAsync(
            ctx,
            "bea",
            new GetGroupCalendarRequest
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                From = TheTrainingDay,
                To = TheTrainingDay,
            },
            ct
        );

        Assert.Equal(new[] { DanceGuardTraining }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsOnlyAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(Window(ctx.Groups.Groups.IdOf("tanzgarde")));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(Window(UnknownGroupId));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheWindowEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildCalendarAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(
            new GetGroupCalendarRequest
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                From = WindowEnd,
                To = WindowStart,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetGroupCalendar, GetGroupCalendarRequest, GetGroupCalendarResponse>(
                Window(UnknownGroupId)
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static GetGroupCalendarRequest Window(int groupId) =>
        new()
        {
            GroupId = groupId,
            From = WindowStart,
            To = WindowEnd,
        };

    private static string[] TitlesOf(GetGroupCalendarResponse result) =>
        [.. result.Entries.Select(entry => entry.Title)];

    private static async Task<GetGroupCalendarResponse> ReadAsync(
        SeededContext ctx,
        string alias,
        GetGroupCalendarRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    private static void WholeClub(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("alice", "Alice", "Muster")
            .AddAccount("alice")
            .AddMembership("alice-first", "alice", JoinedIn2017)
            .AddPerson("bea", "Bea", "Garde")
            .AddAccount("bea")
            .AddMembership("bea-first", "bea", JoinedIn2017)
            .AddPerson("chris", "Chris", "Trainer")
            .AddAccount("chris")
            .AddMembership("chris-first", "chris", JoinedIn2017)
            .AddPerson("ilka", "Ilka", "Gruppenpflege")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017);

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                AtTheTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "kinder-probe",
                                ChildrensRehearsal,
                                AtTheChildrensRehearsal,
                                kind: CalendarEntryKind.Rehearsal,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "kindergarde",
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "prunksitzung",
                                GalaSession,
                                AtTheGalaSession,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "parade",
                                Parade,
                                AtTheParade,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                    ),
            ct
        );
}
