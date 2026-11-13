using System.Diagnostics.Contracts;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Core.Club;

namespace Furria.Infrastructure.Start;

public static class StartComposer
{
    private const int CalendarCap = 5;
    private const int AnnouncementsCap = 3;
    private const int MineCap = 3;
    private const int GroupsCap = 3;
    private const int GalleryCap = 3;
    private const int NewsCap = 1;
    private const int LiveLeadHours = 2;
    private const int RecentDays = 2;
    private const int SoonDays = 7;
    private const int WindowDays = 7;
    private const int TrainingOwedHorizonDays = 14;
    private const int OwedHorizonDays = 42;
    private const int StageDays = 21;

    internal const int NearestReachDays = 60;

    private static readonly TimeSpan LiveLead = TimeSpan.FromHours(LiveLeadHours);

    private static readonly IReadOnlySet<StartMineKind> SoonWhileRecentKinds =
        new HashSet<StartMineKind>
        {
            StartMineKind.NewBoardSeat,
            StartMineKind.NewGroupAdmin,
            StartMineKind.NewGroupMembership,
            StartMineKind.NewKey,
            StartMineKind.ContactChangedByOther,
        };

    [Pure]
    public static StartDetails Compose(StartCandidates candidates, StartMoment moment)
    {
        var calendarRows = CalendarRowsOf(candidates.Entries, moment);

        return new StartDetails
        {
            AsOf = moment.Now,
            Today = moment.Today,
            ReshapeAt = ReshapeAtOf(calendarRows, moment),
            ViewerIsActiveInClub = true,
            Panels = Ranked([
                .. new[]
                {
                    CalendarPanelOf(calendarRows, candidates.AnnouncementAddOns, moment),
                    MinePanelOf(candidates.Mine, moment),
                    AnnouncementsPanelOf(candidates.Announcements),
                    BeerTabPanelOf(candidates.BeerTabs),
                    ToDosPanelOf(candidates.ToDos),
                    GroupsPanelOf(candidates.GroupMoments),
                    NewsPanelOf(candidates.News),
                    GalleryPanelOf(candidates.Albums),
                }.OfType<BandedPanel>(),
            ]),
        };
    }

    [Pure]
    public static StartDetails Inactive(StartMoment moment) =>
        new()
        {
            AsOf = moment.Now,
            Today = moment.Today,
            ReshapeAt = NextMidnightOf(moment),
            ViewerIsActiveInClub = false,
            Panels = [],
        };

    [Pure]
    private static DateTimeOffset ReshapeAtOf(
        IReadOnlyList<StartEntrySummary> calendarRows,
        StartMoment moment
    ) =>
        calendarRows
            .SelectMany(TurnsOf)
            .Append(NextMidnightOf(moment))
            .Where(instant => instant > moment.Now)
            .Min();

    [Pure]
    private static IEnumerable<DateTimeOffset> TurnsOf(StartEntrySummary row) =>
        row.IsRunning ? [EndOf(row)] : [row.StartsAt - LiveLead, row.StartsAt];

    [Pure]
    private static DateTimeOffset EndOf(StartEntrySummary row) =>
        row.EndsAt ?? row.StartsAt.AddHours(CalendarDefaults.OpenEndedHours);

    [Pure]
    private static DateTimeOffset NextMidnightOf(StartMoment moment) =>
        ClubClock.StartOfDay(moment.Today.AddDays(1));

    [Pure]
    private static IReadOnlyList<StartEntrySummary> CalendarRowsOf(
        IReadOnlyList<StartEntrySummary> entries,
        StartMoment moment
    )
    {
        var inWindow = entries.Where(entry => IsInWindow(entry, moment)).ToList();

        return inWindow.Count > 0 ? inWindow : NearestOf(entries, moment);
    }

    [Pure]
    private static IReadOnlyList<StartEntrySummary> NearestOf(
        IReadOnlyList<StartEntrySummary> entries,
        StartMoment moment
    ) =>
        [
            .. InTimeOrder(
                    entries.Where(entry => DayOf(entry) <= moment.Today.AddDays(NearestReachDays))
                )
                .Take(1),
        ];

    [Pure]
    private static bool IsInWindow(StartEntrySummary entry, StartMoment moment) =>
        entry.IsRunning
        || DayOf(entry) <= moment.Today.AddDays(WindowDays)
        || (IsOwed(entry) && DayOf(entry) <= moment.Today.AddDays(OwedHorizonOf(entry.Kind)))
        || (IsOnStage(entry) && DayOf(entry) <= moment.Today.AddDays(StageDays));

    [Pure]
    private static int OwedHorizonOf(CalendarEntryKind kind) =>
        kind == CalendarEntryKind.Training ? TrainingOwedHorizonDays : OwedHorizonDays;

    [Pure]
    private static bool IsOwed(StartEntrySummary entry) =>
        entry.Attendance is { IsOwed: true }
        || entry.OpenPolls.Any(poll => poll.IsOwed)
        || entry.OpenSignUpLists.Any(list => list.IsOwed);

    [Pure]
    private static bool IsOnStage(StartEntrySummary entry) =>
        entry.ParticipatingGroups.Any(group => entry.ViewerGroupIds.Contains(group.GroupId));

    [Pure]
    private static IEnumerable<StartEntrySummary> InTimeOrder(
        IEnumerable<StartEntrySummary> entries
    ) => entries.OrderBy(entry => entry.StartsAt).ThenBy(entry => entry.CalendarEntryId);

    [Pure]
    private static IReadOnlyList<StartPanel> Ranked(IReadOnlyList<BandedPanel> panels)
    {
        var isLiveEvening = panels.Any(banded =>
            banded is { Panel.Kind: StartPanelKind.Calendar, Band: StartBand.Live }
        );

        return
        [
            .. panels
                .OrderBy(banded => isLiveEvening && banded.Panel.Kind == StartPanelKind.ToDos)
                .ThenBy(banded => banded.Band)
                .ThenBy(banded => KindRankOf(banded.Panel.Kind))
                .Select(banded => banded.Panel),
        ];
    }

    [Pure]
    private static int KindRankOf(StartPanelKind kind) =>
        kind switch
        {
            StartPanelKind.Calendar => 0,
            StartPanelKind.Mine => 1,
            StartPanelKind.Announcements => 2,
            StartPanelKind.News => 3,
            StartPanelKind.BeerTab => 4,
            StartPanelKind.ToDos => 5,
            StartPanelKind.Groups => 6,
            StartPanelKind.Gallery => 7,
            _ => 8,
        };

    [Pure]
    private static BandedPanel CalendarPanelOf(
        IReadOnlyList<StartEntrySummary> rows,
        IReadOnlyList<StartAnnouncementAddOns> announcementAddOns,
        StartMoment moment
    )
    {
        var shownCount = ShownCountOf(CalendarCap, rows.Count);
        var picked = rows.OrderBy(row => PickRankOf(row, moment))
            .ThenBy(row => row.StartsAt)
            .ThenBy(row => row.CalendarEntryId)
            .Take(shownCount)
            .Select(row => row.CalendarEntryId)
            .ToHashSet();

        return new BandedPanel(
            PanelOf(StartPanelKind.Calendar, shownCount) with
            {
                Entries =
                [
                    .. InTimeOrder(rows.Where(row => picked.Contains(row.CalendarEntryId))),
                    .. InTimeOrder(rows.Where(row => !picked.Contains(row.CalendarEntryId))),
                ],
                AnnouncementAddOns =
                [
                    .. announcementAddOns
                        .OrderByDescending(announcement => announcement.PublishedAt)
                        .ThenByDescending(announcement => announcement.AnnouncementId),
                ],
            },
            BandOf(rows, announcementAddOns, moment)
        );
    }

    [Pure]
    private static StartBand BandOf(
        IReadOnlyList<StartEntrySummary> rows,
        IReadOnlyList<StartAnnouncementAddOns> announcementAddOns,
        StartMoment moment
    ) =>
        rows.Select(row => BandOf(row, moment))
            .Concat(
                announcementAddOns.Any(announcement => announcement.IsOwed) ? [StartBand.Work] : []
            )
            .Append(StartBand.Later)
            .Min();

    [Pure]
    private static BandedPanel? MinePanelOf(
        IReadOnlyList<StartMineSummary> mine,
        StartMoment moment
    ) =>
        mine.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.Mine, ShownCountOf(MineCap, mine.Count)) with
                {
                    Mine =
                    [
                        .. mine.OrderBy(item => BandOf(item, moment))
                            .ThenByDescending(item => item.On)
                            .ThenBy(item => item.Kind),
                    ],
                },
                mine.Min(item => BandOf(item, moment))
            );

    [Pure]
    private static BandedPanel? AnnouncementsPanelOf(
        IReadOnlyList<StartAnnouncementSummary> announcements
    ) =>
        announcements.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(
                    StartPanelKind.Announcements,
                    ShownCountOf(AnnouncementsCap, announcements.Count)
                ) with
                {
                    Announcements =
                    [
                        .. announcements
                            .OrderByDescending(announcement => announcement.PublishedAt)
                            .ThenByDescending(announcement => announcement.AnnouncementId),
                    ],
                },
                announcements.Any(announcement => announcement.IsNew)
                    ? StartBand.New
                    : StartBand.Later
            );

    [Pure]
    private static BandedPanel? BeerTabPanelOf(IReadOnlyList<StartBeerTabSummary> beerTabs) =>
        beerTabs.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.BeerTab, beerTabs.Count) with
                {
                    BeerTabs =
                    [
                        .. beerTabs
                            .OrderBy(tab => tab.OldestOpenBookedAt)
                            .ThenBy(tab => tab.BeerPotId),
                    ],
                },
                StartBand.Work
            );

    [Pure]
    private static BandedPanel? ToDosPanelOf(IReadOnlyList<ToDoSummary> toDos)
    {
        var waiting = toDos.OrderBy(toDo => toDo.Kind).ToList();

        return waiting.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.ToDos, waiting.Count) with
                {
                    ToDos = waiting,
                },
                StartBand.Work
            );
    }

    [Pure]
    private static BandedPanel? GroupsPanelOf(IReadOnlyList<StartGroupMoment> groupMoments) =>
        groupMoments.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.Groups, ShownCountOf(GroupsCap, groupMoments.Count)) with
                {
                    GroupMoments =
                    [
                        .. groupMoments
                            .OrderByDescending(moment => moment.Years)
                            .ThenBy(moment => moment.GroupId),
                    ],
                },
                StartBand.New
            );

    [Pure]
    private static BandedPanel? GalleryPanelOf(IReadOnlyList<StartAlbumSummary> albums) =>
        albums.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.Gallery, ShownCountOf(GalleryCap, albums.Count)) with
                {
                    Albums =
                    [
                        .. albums
                            .OrderByDescending(album => album.CreatedAt)
                            .ThenByDescending(album => album.AlbumId),
                    ],
                },
                StartBand.New
            );

    [Pure]
    private static BandedPanel? NewsPanelOf(IReadOnlyList<StartNewsSummary> news) =>
        news.Count == 0
            ? null
            : new BandedPanel(
                PanelOf(StartPanelKind.News, NewsCap) with
                {
                    News =
                    [
                        .. news.OrderByDescending(post => post.PublishedAt)
                            .ThenBy(post => post.Slug, StringComparer.Ordinal)
                            .Take(NewsCap),
                    ],
                },
                StartBand.New
            );

    [Pure]
    private static int ShownCountOf(int cap, int total) =>
        total == cap + 1 ? total : Math.Min(cap, total);

    [Pure]
    private static int PickRankOf(StartEntrySummary row, StartMoment moment) =>
        IsLive(row, moment) ? 0
        : DayOf(row) == moment.Today ? 1
        : IsOwed(row) ? 2
        : IsOnStage(row) ? 3
        : 4;

    [Pure]
    private static StartBand BandOf(StartEntrySummary entry, StartMoment moment) =>
        IsLive(entry, moment) ? StartBand.Live
        : DayOf(entry) == moment.Today ? StartBand.Today
        : DayOf(entry) == moment.Today.AddDays(1) ? StartBand.Soon
        : IsOwed(entry) && DayOf(entry) <= moment.Today.AddDays(SoonDays) ? StartBand.Soon
        : StartBand.Later;

    [Pure]
    private static bool IsLive(StartEntrySummary entry, StartMoment moment) =>
        entry.IsRunning || entry.StartsAt - moment.Now <= LiveLead;

    [Pure]
    private static StartBand BandOf(StartMineSummary item, StartMoment moment) =>
        SoonWhileRecentKinds.Contains(item.Kind) && item.On >= moment.Today.AddDays(-RecentDays)
            ? StartBand.Soon
        : item.Kind == StartMineKind.MembershipEnding && item.On <= moment.Today.AddDays(SoonDays)
            ? StartBand.Soon
        : StartBand.New;

    [Pure]
    private static DateOnly DayOf(StartEntrySummary entry) => ClubClock.DayOf(entry.StartsAt);

    [Pure]
    private static StartPanel PanelOf(StartPanelKind kind, int shownCount) =>
        new()
        {
            Kind = kind,
            ShownCount = shownCount,
            Entries = null,
            Announcements = null,
            AnnouncementAddOns = null,
            Mine = null,
            GroupMoments = null,
            ToDos = null,
            Albums = null,
            News = null,
            BeerTabs = null,
        };

    private sealed record BandedPanel(StartPanel Panel, StartBand Band);
}
