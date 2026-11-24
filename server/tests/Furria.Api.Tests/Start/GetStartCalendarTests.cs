using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Api.Tests.RunningOrders;
using Furria.Api.Tests.Studio;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartCalendarTests : IClassFixture<ApiTestFixture>
{
    private const string Coach = "Trainerin";
    private const int PausedSessionYear = 2026;

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Yesterday = new(2027, 1, 18);
    private static readonly DateOnly ArchivedLastSummer = new(2026, 6, 30);

    private static readonly DateTimeOffset TuesdayEvening = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveOutAClubOwnedEntry_When_TheViewerIsOnlyInAnUninvolvedGroup()
    {
        await OnTuesdayEveningAsync(
            "kevin",
            (ctx, start) =>
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "vereinssitzung")
                )
        );
    }

    [Fact]
    public async Task Should_ListAClubOwnedEntry_When_HerGroupParticipatesAndSheIsNoMember()
    {
        await OnTuesdayEveningAsync(
            "kevin",
            (ctx, start) =>
            {
                var gala = EntryOf(start, IdOf(ctx, "prunksitzung"));

                Assert.NotNull(gala.Attendance);
                Assert.Null(gala.Attendance.ViewerAnswer);
                Assert.False(gala.Attendance.IsOwed);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnotherGroupsClubVisibleTraining_When_TheViewerIsAClubMember()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "ballett-training")
                )
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnEvent_When_ItIsStillInPreparation()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity
                                    .AddPerson("lena", "Lena", "Garde")
                                    .AddAccount("lena")
                                    .AddMembership("lena-member", "lena", JoinedIn2015)
                            )
                            .Club(club =>
                                club.AddVenue("buergerhaus", "Bürgerhaus")
                                    .AddEvent(
                                        "in-preparation",
                                        "Kappenabend",
                                        InBerlin(1, 20, 19, 11),
                                        "buergerhaus",
                                        unpublished: true
                                    )
                            ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync("lena", ct);

                var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == ctx.Club.Events.IdOf("in-preparation")
                );
            }
        );
    }

    [Fact]
    public async Task Should_OweAResponse_When_AnEntryConcerningHerAsksAndSheHasNotAnswered()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var meeting = EntryOf(start, IdOf(ctx, "vereinssitzung"));

                Assert.NotNull(meeting.Attendance);
                Assert.Null(meeting.Attendance.ViewerAnswer);
                Assert.True(meeting.Attendance.IsOwed);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAChosenPeopleEntry_When_SheIsNotChosen()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "geheimtreffen")
                )
        );
    }

    [Fact]
    public async Task Should_OweNoResponse_When_TheEntryHasStarted()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var regulars = EntryOf(start, IdOf(ctx, "stammtisch"));

                Assert.NotNull(regulars.Attendance);
                Assert.Null(regulars.Attendance.ViewerAnswer);
                Assert.False(regulars.Attendance.IsOwed);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAClubOwnedEntry_When_HerMembershipIsPausedForThatSession()
    {
        await OnTuesdayEveningAsync(
            "paula",
            (ctx, start) =>
            {
                Assert.True(start.ViewerIsActiveInClub);
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "vereinssitzung")
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnEntry_When_ItsGroupIsArchived()
    {
        await OnTuesdayEveningAsync(
            "otto",
            (ctx, start) =>
            {
                Assert.True(start.ViewerIsActiveInClub);
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "altgarde-treffen")
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnEntry_When_SheLeftTheGroupYesterday()
    {
        await OnTuesdayEveningAsync(
            "frieda",
            (ctx, start) =>
            {
                Assert.True(start.ViewerIsActiveInClub);
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "ballett-training")
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheEntryAsRunning_When_ItHasNoEndAndStartedWithinThreeHours()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var regulars = EntryOf(start, IdOf(ctx, "stammtisch"));

                Assert.True(regulars.IsRunning);
                Assert.Null(regulars.EndsAt);
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "fruehschoppen")
                );
            }
        );
    }

    [Theory]
    [InlineData(true, 1)]
    [InlineData(false, 0)]
    public Task Should_OweAResponseOnlyWhenAsked_When_SheIsAGuestInTheCastOfTheGroupsTraining(
        bool asksForResponse,
        int owedEntries
    ) =>
        _fixture.AtInstantAsync(
            RunningOrderSeeds.InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var today = _fixture.Today;
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        StudioSeeds.GardeWithDancers(today)(builder);
                        builder
                            .Groups(groups =>
                                groups.AddGroupMembership(
                                    "clara-elferrat",
                                    RunningOrderSeeds.Elferrat,
                                    RunningOrderSeeds.Clara,
                                    today.AddDays(-100)
                                )
                            )
                            .Club(club =>
                                club.AddCalendarEntry(
                                    "garde-training",
                                    "Training",
                                    ClubClock.At(today.AddDays(2), new TimeOnly(18, 30)),
                                    kind: CalendarEntryKind.Training,
                                    ownerGroupAlias: RunningOrderSeeds.Garde,
                                    asksForResponse: asksForResponse
                                )
                            );
                    },
                    ct
                );
                await StudioSteps.GardetanzAsync(
                    ctx,
                    ct,
                    added: [ctx.Identity.People.IdOf(RunningOrderSeeds.Clara)]
                );
                var clara = await ctx.Identity.ClientForAsync(RunningOrderSeeds.Clara, ct);

                var (_, start) = await clara.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(
                    owedEntries,
                    EntriesOf(start)
                        .Count(entry =>
                            entry.CalendarEntryId == IdOf(ctx, "garde-training")
                            && entry.Attendance is { IsOwed: true }
                        )
                );
            }
        );

    private static IReadOnlyList<StartEntryDto> EntriesOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Calendar)?.Entries ?? [];

    private static StartEntryDto EntryOf(GetStartResponse start, int calendarEntryId) =>
        Assert.Single(EntriesOf(start), entry => entry.CalendarEntryId == calendarEntryId);

    private static int IdOf(SeededContext ctx, string calendarEntryAlias) =>
        ctx.Club.CalendarEntries.IdOf(calendarEntryAlias);

    private static DateTimeOffset InBerlin(int month, int day, int hour, int minute) =>
        new DateTimeOffset(
            2027,
            month,
            day,
            hour,
            minute,
            0,
            TimeSpan.FromHours(1)
        ).ToUniversalTime();

    private async Task OnTuesdayEveningAsync(
        string viewerAlias,
        Action<SeededContext, GetStartResponse> assert
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync(viewerAlias, ct);

                var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                assert(ctx, start);
            }
        );
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-member", "lena", JoinedIn2015)
                            .AddPerson("kevin", "Kevin", "Ballett")
                            .AddAccount("kevin")
                            .AddPerson("sabine", "Sabine", "Trainerin")
                            .AddAccount("sabine")
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-member", "paula", JoinedIn2015)
                            .AddMembershipPause(
                                "paula-pause",
                                "paula-member",
                                PausedSessionYear,
                                PausedSessionYear
                            )
                            .AddPerson("otto", "Otto", "Altgarde")
                            .AddAccount("otto")
                            .AddMembership("otto-member", "otto", JoinedIn2015)
                            .AddPerson("frieda", "Frieda", "Ehemalig")
                            .AddAccount("frieda")
                            .AddMembership("frieda-member", "frieda", JoinedIn2015)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", tone: TestTones.Rose)
                            .AddGroup("kindergarde", "Kindergarde", tone: TestTones.Lime)
                            .AddGroup("maennerballett", "Männerballett", tone: TestTones.Indigo)
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedLastSummer)
                            .AddGroupMembership("lena-tanzgarde", "tanzgarde", "lena", JoinedIn2015)
                            .AddGroupMembership(
                                "kevin-maennerballett",
                                "maennerballett",
                                "kevin",
                                JoinedIn2015
                            )
                            .AddGroupMembership(
                                "frieda-maennerballett",
                                "maennerballett",
                                "frieda",
                                JoinedIn2015,
                                Yesterday
                            )
                            .AddGroupMembership("otto-altgarde", "altgarde", "otto", JoinedIn2015)
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                Coach,
                                JoinedIn2015
                            )
                    )
                    .Club(club =>
                        club.AddVenue(
                                "sporthalle",
                                "Sporthalle Am Ring",
                                street: "Am Ring 3",
                                zip: "99713",
                                city: "Großfurra",
                                hint: "Eingang an der Rückseite"
                            )
                            .AddVenue("festhalle", "Festhalle Großfurra", sortOrder: 2)
                            .AddKeyHolding("lena-sporthalle", "sporthalle", "lena", JoinedIn2015)
                            .AddCalendarEntry(
                                "garde-training",
                                "Training",
                                InBerlin(1, 19, 19, 30),
                                InBerlin(1, 19, 21, 0),
                                CalendarEntryKind.Training,
                                venueAlias: "sporthalle",
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "stammtisch",
                                "Stammtisch",
                                InBerlin(1, 19, 18, 50),
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "fruehschoppen",
                                "Frühschoppen",
                                InBerlin(1, 19, 15, 30)
                            )
                            .AddCalendarEntry(
                                "vereinssitzung",
                                "Vereinssitzung",
                                InBerlin(1, 20, 19, 30),
                                venueAlias: "festhalle",
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "geheimtreffen",
                                "Überraschung planen",
                                InBerlin(1, 21, 19, 30),
                                asksForResponse: true,
                                audiencePersonAliases: ["kevin"]
                            )
                            .AddCalendarEntry(
                                "ballett-training",
                                "Training Männerballett",
                                InBerlin(1, 20, 20, 0),
                                InBerlin(1, 20, 21, 30),
                                CalendarEntryKind.Training,
                                ownerGroupAlias: "maennerballett"
                            )
                            .AddCalendarEntry(
                                "kinder-training",
                                "Training Kindergarde",
                                InBerlin(1, 20, 17, 0),
                                InBerlin(1, 20, 18, 30),
                                CalendarEntryKind.Training,
                                ownerGroupAlias: "kindergarde"
                            )
                            .AddCalendarEntry(
                                "stellprobe",
                                "Stellprobe",
                                InBerlin(1, 21, 18, 0),
                                kind: CalendarEntryKind.Plain,
                                venueAlias: "festhalle",
                                asksForResponse: true,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "altgarde-treffen",
                                "Treffen der Altgarde",
                                InBerlin(1, 21, 15, 0),
                                ownerGroupAlias: "altgarde"
                            )
                            .AddCalendarEntry(
                                "kinder-probe",
                                "Probe der Kindergarde",
                                InBerlin(1, 22, 16, 0),
                                kind: CalendarEntryKind.Training,
                                ownerGroupAlias: "kindergarde",
                                asksForResponse: true,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "winterball",
                                "Winterball",
                                InBerlin(1, 22, 20, 0),
                                kind: CalendarEntryKind.Plain,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "prunksitzung",
                                "Prunksitzung",
                                InBerlin(1, 23, 19, 11),
                                InBerlin(1, 23, 23, 30),
                                CalendarEntryKind.Trip,
                                venueAlias: "festhalle",
                                asksForResponse: true,
                                participatingGroupAliases: ["maennerballett"]
                            )
                            .AddCalendarEntry(
                                "kinderfasching",
                                "Kinderfasching",
                                InBerlin(2, 7, 14, 11),
                                kind: CalendarEntryKind.Trip,
                                venueAlias: "festhalle",
                                asksForResponse: true,
                                participatingGroupAliases: ["kindergarde"]
                            )
                            .AddCalendarPoll(
                                "food",
                                "vereinssitzung",
                                "Was essen wir?",
                                ["Pizza", "Suppe"],
                                position: 1
                            )
                            .AddCalendarPoll(
                                "drinks",
                                "vereinssitzung",
                                "Was trinken wir?",
                                ["Saft", "Tee"],
                                allowsMultipleChoices: true,
                                position: 2
                            )
                            .AddCalendarPollVote("drinks", "Tee", "lena")
                            .AddCalendarPoll(
                                "closed",
                                "vereinssitzung",
                                "Wer leitet?",
                                ["Otto", "Lena"],
                                closedAt: InBerlin(1, 18, 12, 0),
                                position: 3
                            )
                            .AddCalendarSignUpList(
                                "bring",
                                "vereinssitzung",
                                "Mitbringen",
                                hint: "Bitte eintragen",
                                position: 4
                            )
                            .AddCalendarSignUpList("setup", "vereinssitzung", "Aufbau", position: 5)
                            .AddCalendarSignUpLine("lena-setup", "setup", "lena", "Tische")
                            .AddCalendarSignUpList(
                                "shut",
                                "vereinssitzung",
                                "Abbau",
                                closedAt: InBerlin(1, 18, 12, 0),
                                position: 6
                            )
                            .AddAttendanceResponse(
                                "lena-stellprobe",
                                "stellprobe",
                                "lena",
                                AttendanceAnswer.Maybe
                            )
                            .AddAttendanceResponse(
                                "lena-winterball",
                                "winterball",
                                "lena",
                                AttendanceAnswer.No
                            )
                    ),
            ct
        );
}
