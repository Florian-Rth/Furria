using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Start;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class StartComposerTests
{
    private const int DanceGuard = 11;
    private const int Running = 1;
    private const int LaterToday = 2;
    private const int Wednesday = 3;
    private const int Thursday = 4;
    private const int Friday = 5;
    private const int Saturday = 6;
    private const int Sunday = 7;
    private const int OwedNextMonday = 8;

    private static readonly TimeSpan Berlin = TimeSpan.FromHours(1);

    private static readonly StartMoment TuesdayEvening = StartMoment.At(
        new DateTimeOffset(2027, 1, 19, 19, 50, 0, Berlin)
    );

    private static readonly StartCandidates Nothing = new()
    {
        Entries = [],
        Announcements = [],
        ToDos = [],
        Mine = [],
        GroupMoments = [],
    };

    private static readonly StartCandidates CappedCalendar = Nothing with
    {
        Entries =
        [
            EntryAt(Sunday, OnDay(5, 11, 0)),
            EntryAt(Wednesday, OnDay(1, 18, 0)),
            Owed(EntryAt(OwedNextMonday, OnDay(6, 19, 0))),
            EntryAt(Friday, OnDay(3, 18, 0)),
            RunningSince(Running, OnDay(0, 19, 30)),
            EntryAt(Thursday, OnDay(2, 18, 0)),
            EntryAt(LaterToday, OnDay(0, 23, 0)),
            EntryAt(Saturday, OnDay(4, 14, 0)),
        ],
    };

    [Fact]
    public void Should_DropThePanel_When_ItHasNoItems()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Announcements = [AnnouncementPublishedAt(1, DaysAgo(1))],
            },
            TuesdayEvening
        );

        Assert.Equal([StartPanelKind.Announcements], KindsOf(start));
    }

    [Fact]
    public void Should_RankToDosAboveAnnouncements_When_NothingIsSoon()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(5, 19, 0))],
                Announcements = [AnnouncementPublishedAt(1, DaysAgo(1))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal(
            [StartPanelKind.ToDos, StartPanelKind.Announcements, StartPanelKind.Calendar],
            KindsOf(start)
        );
    }

    [Fact]
    public void Should_RankTheCalendarFirst_When_AnEntryIsRunning()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [RunningSince(1, OnDay(0, 19, 30))],
                Mine = [MineOn(StartMineKind.NewRole, TuesdayEvening.Today)],
                Announcements = [AnnouncementPublishedAt(1, DaysAgo(1))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal(StartPanelKind.Calendar, KindsOf(start)[0]);
    }

    [Fact]
    public void Should_MoveToDosLast_When_HerEntryStartsWithinTwoHours()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(0, 21, 30))],
                Announcements = [AnnouncementPublishedAt(1, DaysAgo(1))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
                GroupMoments = [JubileeOf(1, 25)],
            },
            TuesdayEvening
        );

        Assert.Equal(
            [
                StartPanelKind.Calendar,
                StartPanelKind.Announcements,
                StartPanelKind.Groups,
                StartPanelKind.ToDos,
            ],
            KindsOf(start)
        );
    }

    [Fact]
    public void Should_BreakTiesByKindOrder_When_TwoPanelsShareABand()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(1, 18, 0))],
                Mine = [MineOn(StartMineKind.NewKey, TuesdayEvening.Today)],
                Announcements = [AnnouncementPublishedAt(1, DaysAgo(1))],
                GroupMoments = [JubileeOf(1, 25)],
            },
            TuesdayEvening
        );

        Assert.Equal(
            [
                StartPanelKind.Calendar,
                StartPanelKind.Mine,
                StartPanelKind.Announcements,
                StartPanelKind.Groups,
            ],
            KindsOf(start)
        );
    }

    [Fact]
    public void Should_SetReshapeAt_When_TheNextStartComesBeforeMidnight()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(0, 21, 30)), EntryAt(2, OnDay(1, 18, 0))],
            },
            TuesdayEvening
        );

        Assert.Equal(OnDay(0, 21, 30), start.ReshapeAt);
    }

    [Fact]
    public void Should_SetReshapeAtTwoHoursAhead_When_AnEntryStartsLaterTonight()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(0, 23, 30))],
            },
            TuesdayEvening
        );

        Assert.Equal(OnDay(0, 21, 30), start.ReshapeAt);
    }

    [Fact]
    public void Should_SetReshapeAtToTheRunningEnd_When_AnEntryRuns()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [RunningSince(1, OnDay(0, 19, 30)) with { EndsAt = OnDay(0, 21, 0) }],
            },
            TuesdayEvening
        );

        Assert.Equal(OnDay(0, 21, 0), start.ReshapeAt);
    }

    [Fact]
    public void Should_SetReshapeAtThreeHoursAfterTheStart_When_TheRunningEntryHasNoEnd()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [RunningSince(1, OnDay(0, 19, 0)) with { EndsAt = null }],
            },
            TuesdayEvening
        );

        Assert.Equal(OnDay(0, 22, 0), start.ReshapeAt);
    }

    [Fact]
    public void Should_SetReshapeAtToMidnight_When_NoEntryIsNear()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(3, 19, 0))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal(OnDay(1, 0, 0), start.ReshapeAt);
    }

    [Fact]
    public void Should_RankTheCalendarAboveToDos_When_AnOwedEntryStartsWithinAWeek()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [Owed(EntryAt(1, OnDay(6, 19, 0)))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal([StartPanelKind.Calendar, StartPanelKind.ToDos], KindsOf(start));
    }

    [Fact]
    public void Should_RankTheCalendarAboveToDos_When_HerEntryIsTomorrow()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(1, 19, 0))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal([StartPanelKind.Calendar, StartPanelKind.ToDos], KindsOf(start));
    }

    [Theory]
    [InlineData(StartMineKind.NewRole, -2)]
    [InlineData(StartMineKind.NewBoardSeat, 0)]
    [InlineData(StartMineKind.NewGroupAdmin, -1)]
    [InlineData(StartMineKind.NewGroupMembership, -2)]
    [InlineData(StartMineKind.NewKey, 0)]
    [InlineData(StartMineKind.ContactChangedByOther, -2)]
    [InlineData(StartMineKind.MembershipEnding, 7)]
    public void Should_RankHerItemsAboveToDos_When_TheyAreFresh(
        StartMineKind kind,
        int daysFromToday
    )
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Mine = [MineOn(kind, TuesdayEvening.Today.AddDays(daysFromToday))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal([StartPanelKind.Mine, StartPanelKind.ToDos], KindsOf(start));
    }

    [Theory]
    [InlineData(StartMineKind.NewRole, -3)]
    [InlineData(StartMineKind.ContactChangedByOther, -3)]
    [InlineData(StartMineKind.MembershipEnding, 8)]
    [InlineData(StartMineKind.MembershipPaused, 0)]
    [InlineData(StartMineKind.Milestone, -1)]
    public void Should_RankToDosAboveHerItems_When_TheyAreNoLongerFresh(
        StartMineKind kind,
        int daysFromToday
    )
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Mine = [MineOn(kind, TuesdayEvening.Today.AddDays(daysFromToday))],
                ToDos = [ToDoOf(ToDoKind.NeverInvited)],
            },
            TuesdayEvening
        );

        Assert.Equal([StartPanelKind.ToDos, StartPanelKind.Mine], KindsOf(start));
    }

    [Fact]
    public void Should_KeepAnOwedEntry_When_ItLiesBeyondTheWeekInsideTheOwedHorizon()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries =
                [
                    EntryAt(1, OnDay(1, 18, 0)),
                    Owed(EntryAt(2, OnDay(12, 19, 0))),
                    EntryAt(3, OnDay(12, 20, 0)),
                ],
            },
            TuesdayEvening
        );

        Assert.Equal([1, 2], EntryIdsOf(start));
    }

    [Fact]
    public void Should_LeaveOutAnOwedTraining_When_ItStartsAfterFourteenDays()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries =
                [
                    EntryAt(1, OnDay(1, 18, 0)),
                    Owed(EntryAt(2, OnDay(15, 19, 0)) with { Kind = CalendarEntryKind.Training }),
                    Owed(EntryAt(3, OnDay(15, 19, 0)) with { Kind = CalendarEntryKind.Party }),
                ],
            },
            TuesdayEvening
        );

        Assert.Equal([1, 3], EntryIdsOf(start));
    }

    [Fact]
    public void Should_KeepHerPerformance_When_ItStartsWithinThreeWeeks()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries =
                [
                    EntryAt(1, OnDay(1, 18, 0)),
                    OnStage(EntryAt(2, OnDay(20, 14, 11))),
                    OnStage(EntryAt(3, OnDay(22, 14, 11))),
                    EntryAt(4, OnDay(20, 19, 0)) with
                    {
                        Kind = CalendarEntryKind.Performance,
                    },
                ],
            },
            TuesdayEvening
        );

        Assert.Equal([1, 2], EntryIdsOf(start));
    }

    [Fact]
    public void Should_ShowOnlyTheNearestEntry_When_NothingFallsInTheWindow()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(2, OnDay(30, 18, 0)), EntryAt(1, OnDay(20, 18, 0))],
            },
            TuesdayEvening
        );

        Assert.Equal([1], EntryIdsOf(start));
    }

    [Fact]
    public void Should_DropTheCalendar_When_HerNearestEntryLiesBeyondSixtyDays()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [EntryAt(1, OnDay(61, 18, 0))],
            },
            TuesdayEvening
        );

        Assert.Empty(start.Panels);
    }

    [Fact]
    public void Should_PickRunningTodayOwedFirst_When_TheCalendarIsCapped()
    {
        var calendar = CalendarOf(StartComposer.Compose(CappedCalendar, TuesdayEvening));

        Assert.Equal(5, calendar.ShownCount);
        Assert.Equal(
            new[] { Running, LaterToday, OwedNextMonday, Wednesday, Thursday }.Order(),
            calendar
                .Entries!.Take(calendar.ShownCount)
                .Select(entry => entry.CalendarEntryId)
                .Order()
        );
    }

    [Fact]
    public void Should_PickTheLiveEntry_When_ItStartsWithinTwoHoursAfterMidnight()
    {
        const int AfterMidnight = 1;
        var lateTuesday = StartMoment.At(OnDay(0, 23, 0));

        var calendar = CalendarOf(
            StartComposer.Compose(
                Nothing with
                {
                    Entries =
                    [
                        EntryAt(AfterMidnight, OnDay(1, 0, 30)),
                        .. Enumerable
                            .Range(2, 6)
                            .Select(day => Owed(EntryAt(day + 10, OnDay(day, 19, 0)))),
                    ],
                },
                lateTuesday
            )
        );

        Assert.Contains(
            AfterMidnight,
            calendar.Entries!.Take(calendar.ShownCount).Select(entry => entry.CalendarEntryId)
        );
    }

    [Fact]
    public void Should_PutPickedRowsFirstInTimeOrder_When_TheCalendarIsCapped()
    {
        var calendar = CalendarOf(StartComposer.Compose(CappedCalendar, TuesdayEvening));

        Assert.Equal(
            [Running, LaterToday, Wednesday, Thursday, OwedNextMonday, Friday, Saturday, Sunday],
            calendar.Entries!.Select(entry => entry.CalendarEntryId)
        );
    }

    [Fact]
    public void Should_ShowAll_When_OnlyOneItemExceedsTheCap()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries =
                [
                    .. Enumerable.Range(1, 6).Select(day => EntryAt(day, OnDay(day, 18, 0))),
                ],
                Announcements =
                [
                    .. Enumerable
                        .Range(1, 4)
                        .Select(days => AnnouncementPublishedAt(days, DaysAgo(days))),
                ],
            },
            TuesdayEvening
        );

        Assert.Equal(6, CalendarOf(start).ShownCount);
        Assert.Equal(4, PanelOf(start, StartPanelKind.Announcements).ShownCount);
    }

    [Fact]
    public void Should_CapAnnouncementsAtThree_When_FiveAreNew()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Announcements =
                [
                    AnnouncementPublishedAt(1, DaysAgo(5)),
                    AnnouncementPublishedAt(2, DaysAgo(1)),
                    AnnouncementPublishedAt(3, DaysAgo(3)),
                    AnnouncementPublishedAt(4, DaysAgo(1)),
                    AnnouncementPublishedAt(5, DaysAgo(2)),
                ],
            },
            TuesdayEvening
        );

        var announcements = PanelOf(start, StartPanelKind.Announcements);
        Assert.Equal(3, announcements.ShownCount);
        Assert.Equal(
            [4, 2, 5, 3, 1],
            announcements.Announcements!.Select(announcement => announcement.AnnouncementId)
        );
    }

    [Fact]
    public void Should_ShowEveryToDoInKindOrder_When_TheClubHasWork()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                ToDos =
                [
                    ToDoOf(ToDoKind.ClubRecordGap),
                    ToDoOf(ToDoKind.NeverInvited),
                    ToDoOf(ToDoKind.KeyToTakeBack),
                    ToDoOf(ToDoKind.ReminderDue),
                    ToDoOf(ToDoKind.BirthDateUnknown),
                    ToDoOf(ToDoKind.InPersonOnly),
                ],
            },
            TuesdayEvening
        );

        var toDos = PanelOf(start, StartPanelKind.ToDos);
        Assert.Equal(6, toDos.ShownCount);
        Assert.Equal(
            [
                ToDoKind.NeverInvited,
                ToDoKind.ReminderDue,
                ToDoKind.InPersonOnly,
                ToDoKind.BirthDateUnknown,
                ToDoKind.KeyToTakeBack,
                ToDoKind.ClubRecordGap,
            ],
            toDos.ToDos!.Select(toDo => toDo.Kind)
        );
    }

    [Fact]
    public void Should_OrderHerItemsByBandThenDayThenKind_When_SheHasMoreThanTheCap()
    {
        var today = TuesdayEvening.Today;
        var start = StartComposer.Compose(
            Nothing with
            {
                Mine =
                [
                    MineOn(StartMineKind.NewKey, today.AddDays(-5)),
                    MineOn(StartMineKind.Milestone, today.AddDays(-3)),
                    MineOn(StartMineKind.NewRole, today.AddDays(-5)),
                    MineOn(StartMineKind.MembershipEnding, today.AddDays(20)),
                    MineOn(StartMineKind.NewGroupMembership, today.AddDays(-1)),
                ],
            },
            TuesdayEvening
        );

        var mine = PanelOf(start, StartPanelKind.Mine);
        Assert.Equal(3, mine.ShownCount);
        Assert.Equal(
            [
                StartMineKind.NewGroupMembership,
                StartMineKind.MembershipEnding,
                StartMineKind.Milestone,
                StartMineKind.NewRole,
                StartMineKind.NewKey,
            ],
            mine.Mine!.Select(item => item.Kind)
        );
    }

    [Fact]
    public void Should_OrderJubileesByYears_When_SeveralGroupsCelebrate()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                GroupMoments =
                [
                    JubileeOf(1, 10),
                    JubileeOf(2, 25),
                    JubileeOf(3, 5),
                    JubileeOf(4, 40),
                    JubileeOf(5, 15),
                ],
            },
            TuesdayEvening
        );

        var groups = PanelOf(start, StartPanelKind.Groups);
        Assert.Equal(3, groups.ShownCount);
        Assert.Equal([4, 2, 5, 1, 3], groups.GroupMoments!.Select(moment => moment.GroupId));
    }

    private static StartPanel CalendarOf(StartDetails start) =>
        PanelOf(start, StartPanelKind.Calendar);

    private static StartPanel PanelOf(StartDetails start, StartPanelKind kind) =>
        start.Panels.Single(panel => panel.Kind == kind);

    private static DateTimeOffset DaysAgo(int days) => TuesdayEvening.Now.AddDays(-days);

    private static IReadOnlyList<int> EntryIdsOf(StartDetails start) =>
        [
            .. start
                .Panels.Single(panel => panel.Kind == StartPanelKind.Calendar)
                .Entries!.Select(entry => entry.CalendarEntryId),
        ];

    private static StartEntrySummary Owed(StartEntrySummary entry) =>
        entry with
        {
            Attendance = new StartAttendance { ViewerAnswer = null, IsOwed = true },
        };

    private static StartEntrySummary OnStage(StartEntrySummary entry) =>
        entry with
        {
            Kind = CalendarEntryKind.Performance,
            ViewerGroupIds = [DanceGuard],
        };

    private static DateTimeOffset OnDay(int daysAhead, int hour, int minute) =>
        new DateTimeOffset(2027, 1, 19, hour, minute, 0, Berlin).AddDays(daysAhead);

    private static StartEntrySummary EntryAt(int calendarEntryId, DateTimeOffset startsAt) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = $"Eintrag {calendarEntryId}",
            Kind = CalendarEntryKind.Meeting,
            StartsAt = startsAt,
            EndsAt = startsAt.AddHours(2),
            IsRunning = false,
            Venue = null,
            ViewerHoldsVenueKey = false,
            OwnerGroup = null,
            ParticipatingGroups = [],
            ViewerGroupIds = [],
            ViewerRuns = null,
            Attendance = null,
            Description = null,
        };

    private static StartEntrySummary RunningSince(int calendarEntryId, DateTimeOffset startsAt) =>
        EntryAt(calendarEntryId, startsAt) with
        {
            IsRunning = true,
        };

    private static ToDoSummary ToDoOf(ToDoKind kind) => new() { Kind = kind, Count = 3 };

    private static StartMineSummary MineOn(StartMineKind kind, DateOnly on) =>
        new()
        {
            Kind = kind,
            SubjectId = null,
            On = on,
            Until = on.AddDays(13),
            Name = null,
            GroupTone = null,
            Function = null,
            ChangedBy = null,
            SessionStartYear = null,
            Years = null,
            PermissionKeys = null,
        };

    private static StartGroupMoment JubileeOf(int groupId, int years) =>
        new()
        {
            Kind = StartGroupMomentKind.Jubilee,
            GroupId = groupId,
            Name = $"Gruppe {groupId}",
            Tone = null,
            Years = years,
            FoundedYear = 2026 - years,
            Until = TuesdayEvening.Today.AddDays(3),
        };

    private static IReadOnlyList<StartPanelKind> KindsOf(StartDetails start) =>
        [.. start.Panels.Select(panel => panel.Kind)];

    private static StartAnnouncementSummary AnnouncementPublishedAt(
        int announcementId,
        DateTimeOffset publishedAt
    ) =>
        new()
        {
            AnnouncementId = announcementId,
            Title = $"Aushang {announcementId}",
            Body = "Text",
            PublishedAt = publishedAt,
            ValidUntil = null,
            Author = new StartPerson
            {
                PersonId = 1,
                FirstName = "Karin",
                LastName = "Autorin",
                PortraitUrl = null,
                OfficeName = null,
            },
        };
}
