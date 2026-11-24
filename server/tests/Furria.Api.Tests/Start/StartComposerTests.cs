using Furria.Application.Club;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Start;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class StartComposerTests
{
    private const int DanceGuard = 11;

    private static readonly StartGroupRef DanceGuardRef = new()
    {
        GroupId = DanceGuard,
        Name = "Tanzgarde",
        Tone = null,
    };
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
        AnnouncementAddOns = [],
        ToDos = [],
        Mine = [],
        GroupMoments = [],
        Albums = [],
        News = [],
        BeerTabs = [],
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
    public void Should_RankTheCalendarFirst_When_AnEntryIsRunning()
    {
        var start = StartComposer.Compose(
            Nothing with
            {
                Entries = [RunningSince(1, OnDay(0, 19, 30))],
                Mine = [MineOn(StartMineKind.NewBoardSeat, TuesdayEvening.Today)],
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

    [Theory]
    [InlineData(StartMineKind.NewBoardSeat, 0)]
    [InlineData(StartMineKind.NewGroupMembership, -2)]
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

        Assert.Equal(
            [StartPanelKind.Mine, StartPanelKind.ToDos, StartPanelKind.Calendar],
            KindsOf(start)
        );
    }

    [Theory]
    [InlineData(StartMineKind.NewBoardSeat, -3)]
    [InlineData(StartMineKind.MembershipEnding, 8)]
    [InlineData(StartMineKind.MembershipPaused, 0)]
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

        Assert.Equal(
            [StartPanelKind.ToDos, StartPanelKind.Mine, StartPanelKind.Calendar],
            KindsOf(start)
        );
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
                    Owed(EntryAt(3, OnDay(15, 19, 0)) with { Kind = CalendarEntryKind.Plain }),
                ],
            },
            TuesdayEvening
        );

        Assert.Equal([1, 3], EntryIdsOf(start));
    }

    [Fact]
    public void Should_KeepAnEntryHerGroupPerformsAt_When_ItStartsWithinThreeWeeks()
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
                        Kind = CalendarEntryKind.Trip,
                    },
                    EntryAt(5, OnDay(20, 19, 0)) with
                    {
                        OwnerGroup = DanceGuardRef,
                        ViewerGroupIds = [DanceGuard],
                    },
                ],
            },
            TuesdayEvening
        );

        Assert.Equal([1, 2], EntryIdsOf(start));
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
            ParticipatingGroups = [DanceGuardRef],
            ViewerGroupIds = [DanceGuard],
        };

    private static DateTimeOffset OnDay(int daysAhead, int hour, int minute) =>
        new DateTimeOffset(2027, 1, 19, hour, minute, 0, Berlin).AddDays(daysAhead);

    private static StartEntrySummary EntryAt(int calendarEntryId, DateTimeOffset startsAt) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = $"Eintrag {calendarEntryId}",
            Kind = CalendarEntryKind.Plain,
            StartsAt = startsAt,
            EndsAt = startsAt.AddHours(2),
            IsRunning = false,
            Venue = null,
            ViewerHoldsVenueKey = false,
            OwnerGroup = null,
            ParticipatingGroups = [],
            Audience = CalendarEntryAudience.Club,
            AudienceGroups = [],
            ViewerGroupIds = [],
            ViewerRuns = null,
            Attendance = null,
            OpenPolls = [],
            OpenSignUpLists = [],
            Description = null,
            Event = null,
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
            Mentions = AnnouncementMentionTargets.None,
            PublishedAt = publishedAt,
            ValidUntil = null,
            IsNew = true,
            Author = new StartPerson
            {
                PersonId = 1,
                FirstName = "Karin",
                LastName = "Autorin",
                Portrait = null,
                OfficeName = null,
            },
        };
}
