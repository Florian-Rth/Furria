using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetGroupCalendarTests : IClassFixture<ApiTestFixture>
{
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string GalaSession = "Prunksitzung";
    private const string ChildrensRehearsal = "Probe der Kindergarde";
    private const string Parade = "Rosenmontagsumzug";
    private const string ChildrensShow = "Auftritt der Kindergarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateTimeOffset Now = new(2027, 1, 4, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateOnly WindowStart = new(2027, 1, 1);
    private static readonly DateOnly WindowEnd = new(2027, 3, 1);

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

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    Window(ctx.Groups.Groups.IdOf("tanzgarde")),
                    ct
                );

                Assert.Equal(
                    new[] { DanceGuardTraining, ChildrensRehearsal, ChildrensShow, GalaSession },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_LetHerAnswer_When_SheAdministersTheGroupWithoutClubRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "sabine",
                    Window(ctx.Groups.Groups.IdOf("kindergarde")),
                    ct
                );

                Assert.True(AnswersAttendance(EntryTitled(result, ChildrensRehearsal)));
            }
        );
    }

    [Fact]
    public async Task Should_NotLetHerAnswer_When_SheOnlyManagesGroups()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "gerda",
                    Window(ctx.Groups.Groups.IdOf("tanzgarde")),
                    ct
                );

                Assert.False(AnswersAttendance(EntryTitled(result, GalaSession)));
            }
        );
    }

    [Fact]
    public async Task Should_SummariseTheOpenFunctionsForHer_When_SheReadsTheGroupCalendar()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    Window(ctx.Groups.Groups.IdOf("tanzgarde")),
                    ct
                );

                var training = EntryTitled(result, DanceGuardTraining);
                Assert.Equal(
                    [
                        (CalendarEntryAddOnKind.Poll, ctx.Club.Polls.IdOf("garde-drinks"), true),
                        (
                            CalendarEntryAddOnKind.SignUpList,
                            ctx.Club.SignUpLists.IdOf("garde-chairs"),
                            false
                        ),
                    ],
                    training.OpenFunctions.Select(open =>
                        (open.Kind, open.AddOnId, open.HasAnswered)
                    )
                );
                Assert.True(training.MayAnswer);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheClubEntry_When_TheGroupDoesNotParticipate()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    Window(ctx.Groups.Groups.IdOf("tanzgarde")),
                    ct
                );

                Assert.DoesNotContain(Parade, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsOnlyAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var client = await ctx.Identity.ClientForAsync("alice", ct);
                var (response, _) = await client.GETAsync<
                    GetGroupCalendar,
                    GetGroupCalendarRequest,
                    GetGroupCalendarResponse
                >(Window(ctx.Groups.Groups.IdOf("tanzgarde")));

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );
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

    private static bool AnswersAttendance(GroupCalendarEntryDto entry) =>
        entry.AsksForResponse && entry.MayAnswer;

    private static GroupCalendarEntryDto EntryTitled(
        GetGroupCalendarResponse result,
        string title
    ) => result.Entries.Single(entry => entry.Title == title);

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
            .AddMembership("ilka-first", "ilka", JoinedIn2017)
            .AddPerson("sabine", "Sabine", "Trainerin")
            .AddAccount("sabine")
            .AddPerson("gerda", "Gerda", "Gruppenpflege")
            .AddAccount("gerda");

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "ilka-gruppenpflege",
                                "Gruppenpflege",
                                "ilka",
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleHolding("gerda-gruppenpflege", "gruppenpflege", "gerda")
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
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-training",
                                DanceGuardTraining,
                                AtTheTraining,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarPoll(
                                "garde-drinks",
                                "garde-training",
                                "Was trinken wir?",
                                ["Saft", "Tee"]
                            )
                            .AddCalendarPollVote("garde-drinks", "Tee", "bea")
                            .AddCalendarSignUpList("garde-chairs", "garde-training", "Stühle")
                            .AddCalendarSignUpList(
                                "garde-tables",
                                "garde-training",
                                "Tische",
                                closedAt: Now.AddDays(-1)
                            )
                            .AddCalendarPoll(
                                "garde-music",
                                "garde-training",
                                "Welche Musik?",
                                ["Marsch", "Polka"],
                                votesUntil: Now
                            )
                            .AddCalendarEntry(
                                "kinder-probe",
                                ChildrensRehearsal,
                                AtTheChildrensRehearsal,
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "kindergarde",
                                asksForResponse: true,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "kinder-show",
                                ChildrensShow,
                                AtTheChildrensRehearsal.AddDays(2),
                                ownerGroupAlias: "kindergarde",
                                audience: CalendarEntryAudience.Groups,
                                audienceGroupAliases: ["kindergarde"],
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarPoll(
                                "kinder-snacks",
                                "kinder-show",
                                "Welche Snacks?",
                                ["Obst", "Kekse"]
                            )
                            .AddCalendarEntry(
                                "prunksitzung",
                                GalaSession,
                                AtTheGalaSession,
                                asksForResponse: true,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "parade",
                                Parade,
                                AtTheParade,
                                kind: CalendarEntryKind.Trip
                            )
                    ),
            ct
        );
}
