using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActEveningReader
{
    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly EveningStageTimes _stageTimes;
    private readonly TimeProvider _timeProvider;

    public ActEveningReader(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        EveningStageTimes stageTimes,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _stageTimes = stageTimes;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<StudioEveningDetails>> EveningsOfAsync(
        ActSummary act,
        CancellationToken ct
    )
    {
        var appearances = await AppearanceRowsAsync(act.ActId, ct);
        var appearing = appearances.Select(row => row.EventId).ToHashSet();
        var open = (await OpenEveningsAsync(act, ct)).Where(row =>
            !appearing.Contains(row.EventId)
        );
        var details = await AppearanceDetailsAsync(appearances, ct);

        return
        [
            .. appearances
                .Select(row => EveningOf(row.EventId, row.Title, row.StartsAt, details[row.Id]))
                .Concat(open.Select(row => EveningOf(row.EventId, row.Title, row.StartsAt, null)))
                .OrderBy(evening => evening.StartsAt)
                .ThenBy(evening => evening.EventId),
        ];
    }

    private async Task<List<AppearanceRow>> AppearanceRowsAsync(int actId, CancellationToken ct) =>
        await _dbContext
            .Appearances.AsNoTracking()
            .Where(appearance => appearance.ActId == actId)
            .Select(appearance => new AppearanceRow(
                appearance.Id,
                appearance.CalendarEntryId,
                appearance.CalendarEntry!.Title,
                appearance.CalendarEntry.StartsAt,
                appearance.ActId,
                appearance.Position
            ))
            .ToListAsync(ct);

    private async Task<IReadOnlyList<EveningRow>> OpenEveningsAsync(
        ActSummary act,
        CancellationToken ct
    )
    {
        if (act.SessionYear is not { } sessionYear || !ActStudioGate.IsEditable(act))
            return [];

        var from = ClubClock.StartOfDay(ClubClock.Today(_timeProvider));
        var rows = await _dbContext
            .Events.AsNoTracking()
            .Where(row => row.CancelledAt == null && row.CalendarEntry!.StartsAt >= from)
            .Select(row => new EveningRow(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt
            ))
            .ToListAsync(ct);

        return
        [
            .. rows.Where(row =>
                ClubSession.RelevantYearOf(ClubClock.DayOf(row.StartsAt)) == sessionYear
            ),
        ];
    }

    private async Task<IReadOnlyDictionary<int, StudioAppearanceDetails>> AppearanceDetailsAsync(
        IReadOnlyList<AppearanceRow> appearances,
        CancellationToken ct
    )
    {
        var ids = appearances.Select(row => row.Id).ToList();
        var stageStarts = await _stageTimes.StartsOfAsync(
            [.. appearances.Where(row => row.Position is not null).Select(row => row.EventId)],
            ct
        );
        var castChanges = await _dbContext
            .AppearanceCastChanges.AsNoTracking()
            .Where(change => ids.Contains(change.AppearanceId))
            .ToListAsync(ct);
        var spotChanges = await _dbContext
            .AppearanceSpots.AsNoTracking()
            .Where(spot => ids.Contains(spot.AppearanceId))
            .OrderBy(spot => spot.Spot!.Number)
            .ToListAsync(ct);
        var copies = await _dbContext
            .Choreographies.AsNoTracking()
            .Where(choreography =>
                choreography.AppearanceId != null && ids.Contains(choreography.AppearanceId.Value)
            )
            .ToDictionaryAsync(choreography => choreography.AppearanceId!.Value, ct);
        var people = (
            await _catalogue.PersonsInNameOrderAsync(
                [
                    .. castChanges
                        .Select(change => change.PersonId)
                        .Concat(spotChanges.Select(spot => spot.PersonId).OfType<int>())
                        .Distinct(),
                ],
                ct
            )
        ).ToList();
        var personOf = people.ToDictionary(person => person.PersonId);

        return appearances.ToDictionary(
            row => row.Id,
            row => new StudioAppearanceDetails
            {
                AppearanceId = row.Id,
                Position = row.Position,
                StageStartsAt = stageStarts.TryGetValue(
                    new StagedAct(row.EventId, row.ActId),
                    out var stageStartsAt
                )
                    ? stageStartsAt
                    : null,
                Added =
                [
                    .. people.Where(person =>
                        castChanges.Any(change =>
                            change.AppearanceId == row.Id
                            && change.PersonId == person.PersonId
                            && change.Change == CastChange.Added
                        )
                    ),
                ],
                RemovedPersonIds =
                [
                    .. castChanges
                        .Where(change =>
                            change.AppearanceId == row.Id && change.Change == CastChange.Removed
                        )
                        .Select(change => change.PersonId)
                        .Order(),
                ],
                SpotChanges =
                [
                    .. spotChanges
                        .Where(spot => spot.AppearanceId == row.Id)
                        .Select(spot => new StudioSpotChangeDetails
                        {
                            SpotId = spot.SpotId,
                            Person = spot.PersonId is { } personId
                                ? personOf.GetValueOrDefault(personId)
                                : null,
                        }),
                ],
                Choreography = copies.TryGetValue(row.Id, out var copy)
                    ? new StudioEveningChoreographyDetails
                    {
                        Version = copy.Version,
                        CopiedFromVersion = copy.CopiedFromVersion,
                        Document = copy.Document,
                    }
                    : null,
            }
        );
    }

    [Pure]
    private static StudioEveningDetails EveningOf(
        int eventId,
        string title,
        DateTimeOffset startsAt,
        StudioAppearanceDetails? appearance
    ) =>
        new()
        {
            EventId = eventId,
            Title = title,
            StartsAt = startsAt,
            Appearance = appearance,
        };

    private sealed record AppearanceRow(
        int Id,
        int EventId,
        string Title,
        DateTimeOffset StartsAt,
        int ActId,
        int? Position
    );

    private sealed record EveningRow(int EventId, string Title, DateTimeOffset StartsAt);
}
