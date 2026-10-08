using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Core.Groups;
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
    public async Task Should_ListAClubOwnedEntry_When_TheViewerHoldsARunningMembership()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
                Assert.Contains(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "vereinssitzung")
                )
        );
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
    public async Task Should_ListAClubOwnedEntry_When_SheAdministersAParticipatingGroup()
    {
        await OnTuesdayEveningAsync(
            "sabine",
            (ctx, start) =>
            {
                var carnival = EntryOf(start, IdOf(ctx, "kinderfasching"));

                Assert.NotNull(carnival.ViewerRuns);
                Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), carnival.ViewerRuns.GroupId);
            }
        );
    }

    [Fact]
    public async Task Should_ListAGroupOnlyEntry_When_TheViewerIsInAParticipatingGroup()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
                Assert.Contains(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "kinder-probe")
                )
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
    public async Task Should_MarkTheRunGroupAndFunction_When_TheViewerAdministersTheOwnerGroup()
    {
        await OnTuesdayEveningAsync(
            "sabine",
            (ctx, start) =>
            {
                var training = EntryOf(start, IdOf(ctx, "kinder-training"));

                Assert.NotNull(training.ViewerRuns);
                Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), training.ViewerRuns.GroupId);
                Assert.Equal(Coach, training.ViewerRuns.Function);
            }
        );
    }

    [Fact]
    public async Task Should_CarryAttendanceWithoutOwing_When_SheOnlyRunsAnEntryThatAsks()
    {
        await OnTuesdayEveningAsync(
            "sabine",
            (ctx, start) =>
            {
                var rehearsal = EntryOf(start, IdOf(ctx, "kinder-probe"));

                Assert.NotNull(rehearsal.Attendance);
                Assert.Null(rehearsal.Attendance.ViewerAnswer);
                Assert.False(rehearsal.Attendance.IsOwed);
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
    public async Task Should_OweNoResponse_When_SheAnsweredMaybe()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var rehearsal = EntryOf(start, IdOf(ctx, "stellprobe"));

                Assert.NotNull(rehearsal.Attendance);
                Assert.Equal(AttendanceAnswer.Maybe, rehearsal.Attendance.ViewerAnswer);
                Assert.False(rehearsal.Attendance.IsOwed);
            }
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
    public async Task Should_LeaveOutAnEntry_When_SheAnsweredNo()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
                Assert.DoesNotContain(
                    EntriesOf(start),
                    entry => entry.CalendarEntryId == IdOf(ctx, "winterball")
                )
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

    [Fact]
    public async Task Should_FlagTheVenueKey_When_TheViewerHoldsARunningKeyForTheVenue()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                Assert.True(EntryOf(start, IdOf(ctx, "garde-training")).ViewerHoldsVenueKey);
                Assert.False(EntryOf(start, IdOf(ctx, "vereinssitzung")).ViewerHoldsVenueKey);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheVenueAddress_When_TheEntryHasAVenue()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var training = EntryOf(start, IdOf(ctx, "garde-training"));

                Assert.NotNull(training.Venue);
                Assert.Equal(ctx.Club.Venues.IdOf("sporthalle"), training.Venue.VenueId);
                Assert.Equal("Sporthalle Am Ring", training.Venue.Name);
                Assert.Equal("Am Ring 3", training.Venue.Street);
                Assert.Equal("99713", training.Venue.Zip);
                Assert.Equal("Großfurra", training.Venue.City);
                Assert.Equal("Eingang an der Rückseite", training.Venue.Hint);
                Assert.Null(EntryOf(start, IdOf(ctx, "stammtisch")).Venue);
            }
        );
    }

    [Fact]
    public async Task Should_NameHerGroups_When_HerGroupOwnsOrParticipates()
    {
        await OnTuesdayEveningAsync(
            "lena",
            (ctx, start) =>
            {
                var danceGuardId = ctx.Groups.Groups.IdOf("tanzgarde");
                var training = EntryOf(start, IdOf(ctx, "garde-training"));
                var rehearsal = EntryOf(start, IdOf(ctx, "kinder-probe"));

                Assert.Equal([danceGuardId], training.ViewerGroupIds);
                Assert.NotNull(training.OwnerGroup);
                Assert.Equal("Tanzgarde", training.OwnerGroup.Name);
                Assert.Equal(GroupTone.Rose, training.OwnerGroup.Tone);
                Assert.Equal([danceGuardId], rehearsal.ViewerGroupIds);
                Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), rehearsal.OwnerGroup?.GroupId);
                Assert.Equal(
                    [danceGuardId],
                    rehearsal.ParticipatingGroups.Select(group => group.GroupId)
                );
                Assert.Empty(EntryOf(start, IdOf(ctx, "vereinssitzung")).ViewerGroupIds);
            }
        );
    }

    [Fact]
    public async Task Should_DropTheOwedFlag_When_SheAnswersIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("lena", ct);
                var meetingId = IdOf(ctx, "vereinssitzung");

                var answered = await client.POSTAsync<
                    PostCalendarResponse,
                    PostCalendarResponseRequest
                >(
                    new PostCalendarResponseRequest
                    {
                        CalendarEntryId = meetingId,
                        Answer = AttendanceAnswer.Yes,
                    }
                );
                var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.NoContent, answered.StatusCode);
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var meeting = EntryOf(start, meetingId);
                Assert.NotNull(meeting.Attendance);
                Assert.Equal(AttendanceAnswer.Yes, meeting.Attendance.ViewerAnswer);
                Assert.False(meeting.Attendance.IsOwed);
            }
        );
    }

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
                            .AddGroup("tanzgarde", "Tanzgarde", tone: GroupTone.Rose)
                            .AddGroup("kindergarde", "Kindergarde", tone: GroupTone.Lime)
                            .AddGroup("maennerballett", "Männerballett", tone: GroupTone.Indigo)
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
                                CalendarEntryVisibility.Group,
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
                                CalendarEntryVisibility.Group,
                                ownerGroupAlias: "kindergarde"
                            )
                            .AddCalendarEntry(
                                "stellprobe",
                                "Stellprobe",
                                InBerlin(1, 21, 18, 0),
                                kind: CalendarEntryKind.Rehearsal,
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
                                kind: CalendarEntryKind.Rehearsal,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "kindergarde",
                                asksForResponse: true,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "winterball",
                                "Winterball",
                                InBerlin(1, 22, 20, 0),
                                kind: CalendarEntryKind.Party,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "prunksitzung",
                                "Prunksitzung",
                                InBerlin(1, 23, 19, 11),
                                InBerlin(1, 23, 23, 30),
                                CalendarEntryKind.Performance,
                                venueAlias: "festhalle",
                                asksForResponse: true,
                                participatingGroupAliases: ["maennerballett"]
                            )
                            .AddCalendarEntry(
                                "kinderfasching",
                                "Kinderfasching",
                                InBerlin(2, 7, 14, 11),
                                kind: CalendarEntryKind.Performance,
                                venueAlias: "festhalle",
                                asksForResponse: true,
                                participatingGroupAliases: ["kindergarde"]
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
