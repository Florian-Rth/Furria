using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Studio;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class EveningStageTimes
{
    private readonly AppDbContext _dbContext;
    private readonly ActTimelineReader _timelines;

    public EveningStageTimes(AppDbContext dbContext, ActTimelineReader timelines)
    {
        _dbContext = dbContext;
        _timelines = timelines;
    }

    public async Task<IReadOnlyDictionary<StagedAct, DateTimeOffset>> StartsOfAsync(
        IReadOnlyCollection<int> eventIds,
        CancellationToken ct
    )
    {
        var placed = await _dbContext
            .Appearances.AsNoTracking()
            .Where(appearance =>
                eventIds.Contains(appearance.CalendarEntryId) && appearance.Position != null
            )
            .OrderBy(appearance => appearance.Position)
            .Select(appearance => new PlacedAct(
                appearance.CalendarEntryId,
                appearance.CalendarEntry!.StartsAt,
                appearance.ActId,
                appearance.Act!.Kind
            ))
            .ToListAsync(ct);
        var musicLengths = await _timelines.MusicLengthsOfAsync(
            [.. placed.Select(act => act.ActId)],
            ct
        );

        return placed
            .GroupBy(act => act.EventId)
            .SelectMany(evening => StartsOf([.. evening], musicLengths))
            .ToDictionary(start => start.Act, start => start.StartsAt);
    }

    public async Task<IReadOnlyList<DateTimeOffset>> StartsInOrderAsync(
        DateTimeOffset eveningStart,
        IReadOnlyList<ActSummary> order,
        CancellationToken ct
    )
    {
        var musicLengths = await _timelines.MusicLengthsOfAsync(
            [.. order.Select(act => act.ActId)],
            ct
        );

        return StageClock.StartsOf(
            eveningStart,
            [.. order.Select(act => StageClock.LengthOf(act.Kind, musicLengths[act.ActId]))]
        );
    }

    [Pure]
    private static IEnumerable<(StagedAct Act, DateTimeOffset StartsAt)> StartsOf(
        IReadOnlyList<PlacedAct> evening,
        IReadOnlyDictionary<int, double> musicLengths
    )
    {
        var starts = StageClock.StartsOf(
            evening[0].EveningStartsAt,
            [.. evening.Select(act => StageClock.LengthOf(act.Kind, musicLengths[act.ActId]))]
        );

        return evening.Select(
            (act, index) => (new StagedAct(act.EventId, act.ActId), starts[index])
        );
    }

    private sealed record PlacedAct(
        int EventId,
        DateTimeOffset EveningStartsAt,
        int ActId,
        ActKind? Kind
    );
}
