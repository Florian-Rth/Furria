using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class ActSeasonReader
{
    private readonly AppDbContext _dbContext;
    private readonly ActService _actService;
    private readonly ActCatalogue _catalogue;

    public ActSeasonReader(AppDbContext dbContext, ActService actService, ActCatalogue catalogue)
    {
        _dbContext = dbContext;
        _actService = actService;
        _catalogue = catalogue;
    }

    public async Task<ActSeasonDetails> GetSeasonAsync(int? sessionYear, CancellationToken ct)
    {
        var shown = await _actService.GetActsAsync(ActScope.Everything, sessionYear, ct);
        var acts = shown.Acts.Where(act => !act.IsArchived).ToList();
        var evenings = await EveningsOfAsync(shown.SessionYear, ct);
        var cells = await AppearancesOfAsync(acts, evenings, ct);
        var facts = await FactsOfAsync(acts, ct);

        return new ActSeasonDetails
        {
            SessionYear = shown.SessionYear,
            SessionYears = shown.SessionYears,
            Evenings = evenings,
            Acts =
            [
                .. acts.Select(act => new SeasonActSummary
                {
                    ActId = act.ActId,
                    Name = act.Name,
                    Kind = act.Kind,
                    Group = act.Group,
                    CastCount = act.Cast.Count,
                    Readiness = ActReadiness.ChecksOf(act.Kind, facts.Of(act)),
                    Appearances = [.. cells[act.ActId]],
                }),
            ],
        };
    }

    private async Task<IReadOnlyList<SeasonEveningSummary>> EveningsOfAsync(
        int sessionYear,
        CancellationToken ct
    )
    {
        var from = ClubClock.StartOfDay(ClubSession.ClosingOf(sessionYear - 1));
        var until = ClubClock.StartOfDay(ClubSession.ClosingOf(sessionYear));
        var rows = await _dbContext
            .Events.AsNoTracking()
            .Where(row =>
                row.CancelledAt == null
                && row.CalendarEntry!.StartsAt >= from
                && row.CalendarEntry.StartsAt < until
            )
            .OrderBy(row => row.CalendarEntry!.StartsAt)
            .ThenBy(row => row.CalendarEntryId)
            .Select(row => new
            {
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                Order = _dbContext
                    .RunningOrders.Where(order => order.CalendarEntryId == row.CalendarEntryId)
                    .Select(order => new { order.ConfirmedAt, order.ChangedSinceConfirmed })
                    .FirstOrDefault(),
            })
            .ToListAsync(ct);

        return
        [
            .. rows.Where(row =>
                    ClubSession.RelevantYearOf(ClubClock.DayOf(row.StartsAt)) == sessionYear
                )
                .Select(row => new SeasonEveningSummary
                {
                    EventId = row.CalendarEntryId,
                    Title = row.Title,
                    StartsAt = row.StartsAt,
                    HasRunningOrder = row.Order is not null,
                    IsConfirmed =
                        row.Order is { ConfirmedAt: not null, ChangedSinceConfirmed: false },
                }),
        ];
    }

    private async Task<ILookup<int, SeasonAppearanceSummary>> AppearancesOfAsync(
        IReadOnlyList<ActSummary> acts,
        IReadOnlyList<SeasonEveningSummary> evenings,
        CancellationToken ct
    )
    {
        var actIds = acts.Select(act => act.ActId).ToList();
        var eventIds = evenings.Select(evening => evening.EventId).ToList();
        var appearances = await _dbContext
            .Appearances.AsNoTracking()
            .Include(appearance => appearance.CastChanges)
            .Where(appearance =>
                actIds.Contains(appearance.ActId) && eventIds.Contains(appearance.CalendarEntryId)
            )
            .ToListAsync(ct);
        var ids = appearances.Select(appearance => appearance.Id).ToList();
        var withSpots = await _dbContext
            .AppearanceSpots.Where(spot => ids.Contains(spot.AppearanceId))
            .Select(spot => spot.AppearanceId)
            .Distinct()
            .ToHashSetAsync(ct);
        var withCopy = await _dbContext
            .Choreographies.Where(choreography =>
                choreography.AppearanceId != null && ids.Contains(choreography.AppearanceId.Value)
            )
            .Select(choreography => choreography.AppearanceId!.Value)
            .ToHashSetAsync(ct);
        var people = (
            await _catalogue.PersonsInNameOrderAsync(
                [
                    .. appearances
                        .SelectMany(appearance => appearance.CastChanges)
                        .Select(change => change.PersonId)
                        .Distinct(),
                ],
                ct
            )
        ).ToList();
        var eveningOrder = eventIds.Select((id, index) => (id, index)).ToDictionary();

        return appearances
            .OrderBy(appearance => eveningOrder[appearance.CalendarEntryId])
            .ToLookup(
                appearance => appearance.ActId,
                appearance =>
                    CellOf(
                        appearance,
                        withSpots.Contains(appearance.Id),
                        withCopy.Contains(appearance.Id),
                        people
                    )
            );
    }

    private async Task<ReadinessFacts> FactsOfAsync(
        IReadOnlyList<ActSummary> acts,
        CancellationToken ct
    )
    {
        var actIds = acts.Select(act => act.ActId).ToList();
        var songs = await CountsAsync(
            _dbContext
                .ActSongs.Where(song => actIds.Contains(song.ActId))
                .Select(song => song.ActId),
            ct
        );
        var steps = await CountsAsync(
            _dbContext
                .ActSteps.Where(step => actIds.Contains(step.ActId))
                .Select(step => step.ActId),
            ct
        );
        var videos = await CountsAsync(
            _dbContext
                .ActVideos.Where(video => actIds.Contains(video.ActId))
                .Select(video => video.ActId),
            ct
        );
        var adopted = await _dbContext
            .ActFinalTracks.Where(track => actIds.Contains(track.ActId) && track.AdoptedAt != null)
            .Select(track => track.ActId)
            .Distinct()
            .ToHashSetAsync(ct);
        var spots = await _dbContext
            .Spots.AsNoTracking()
            .Where(spot => actIds.Contains(spot.ActId))
            .Select(spot => new SpotRow(spot.Id, spot.ActId, spot.PersonId))
            .ToListAsync(ct);
        var documents = await _dbContext
            .Choreographies.AsNoTracking()
            .Where(choreography =>
                actIds.Contains(choreography.ActId) && choreography.AppearanceId == null
            )
            .Select(choreography => new { choreography.ActId, choreography.Document })
            .ToListAsync(ct);

        return new ReadinessFacts(
            songs,
            steps,
            videos,
            adopted,
            spots.ToLookup(spot => spot.ActId),
            documents.ToDictionary(row => row.ActId, row => PlacedSpotIdsOf(row.Document))
        );
    }

    private static async Task<IReadOnlyDictionary<int, int>> CountsAsync(
        IQueryable<int> actIds,
        CancellationToken ct
    ) =>
        await actIds
            .GroupBy(actId => actId)
            .Select(group => new { ActId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(row => row.ActId, row => row.Count, ct);

    [Pure]
    private static IReadOnlySet<int> PlacedSpotIdsOf(ChoreographyDocument document) =>
        document
            .Tracks.Where(track => track.Keyframes.Count > 0)
            .Select(track => track.SpotId)
            .ToHashSet();

    [Pure]
    private static SeasonAppearanceSummary CellOf(
        Appearance appearance,
        bool hasSpotChanges,
        bool hasOwnChoreography,
        IReadOnlyList<CastMember> people
    )
    {
        var added = ChangedPersonIds(appearance, CastChange.Added);
        var removed = ChangedPersonIds(appearance, CastChange.Removed);

        return new SeasonAppearanceSummary
        {
            AppearanceId = appearance.Id,
            EventId = appearance.CalendarEntryId,
            Position = appearance.Position,
            Changes =
            [
                .. new[]
                {
                    (appearance.CastChanges.Count > 0, EveningChange.Cast),
                    (hasSpotChanges, EveningChange.Spots),
                    (hasOwnChoreography, EveningChange.Choreography),
                }
                    .Where(pair => pair.Item1)
                    .Select(pair => pair.Item2),
            ],
            Added = [.. people.Where(person => added.Contains(person.PersonId))],
            Removed = [.. people.Where(person => removed.Contains(person.PersonId))],
        };
    }

    [Pure]
    private static IReadOnlySet<int> ChangedPersonIds(Appearance appearance, CastChange change) =>
        appearance
            .CastChanges.Where(row => row.Change == change)
            .Select(row => row.PersonId)
            .ToHashSet();

    private sealed record SpotRow(int SpotId, int ActId, int? PersonId);

    private sealed class ReadinessFacts
    {
        private readonly IReadOnlyDictionary<int, int> _songs;
        private readonly IReadOnlyDictionary<int, int> _steps;
        private readonly IReadOnlyDictionary<int, int> _videos;
        private readonly IReadOnlySet<int> _adopted;
        private readonly ILookup<int, SpotRow> _spots;
        private readonly IReadOnlyDictionary<int, IReadOnlySet<int>> _placed;

        public ReadinessFacts(
            IReadOnlyDictionary<int, int> songs,
            IReadOnlyDictionary<int, int> steps,
            IReadOnlyDictionary<int, int> videos,
            IReadOnlySet<int> adopted,
            ILookup<int, SpotRow> spots,
            IReadOnlyDictionary<int, IReadOnlySet<int>> placed
        )
        {
            _songs = songs;
            _steps = steps;
            _videos = videos;
            _adopted = adopted;
            _spots = spots;
            _placed = placed;
        }

        public ActReadinessFacts Of(ActSummary act)
        {
            var spots = _spots[act.ActId].ToList();
            var placed = _placed.GetValueOrDefault(act.ActId) ?? new HashSet<int>();

            return new ActReadinessFacts(
                SongCount: _songs.GetValueOrDefault(act.ActId),
                HasAdoptedFinalFile: _adopted.Contains(act.ActId),
                StepCount: _steps.GetValueOrDefault(act.ActId),
                SpotCount: spots.Count,
                HeldSpotCount: spots.Count(spot => spot.PersonId is not null),
                PlacedSpotCount: spots.Count(spot => placed.Contains(spot.SpotId)),
                VideoCount: _videos.GetValueOrDefault(act.ActId),
                CastCount: act.Cast.Count
            );
        }
    }
}
