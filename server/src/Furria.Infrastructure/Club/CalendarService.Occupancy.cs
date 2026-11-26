using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Events;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    public async Task<VenueOccupancy> GetVenueOccupancyAsync(
        VenueOccupancyQuery query,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var probe = new VenueCollisionQuery
        {
            ViewerPersonId = query.PersonId,
            VenueId = query.VenueId,
            StartsAt = query.StartsAt,
            EndsAt = query.EndsAt,
            ExcludeCalendarEntryId = null,
        };
        var colliding = await CollidingRowsAsync(probe, now, ct);
        var seen = await SeenAmongAsync(
            new CalendarViewer(query.PersonId, query.Rights),
            colliding,
            ClubClock.DayOf(now),
            ct
        );

        return new VenueOccupancy
        {
            SeenEntries =
            [
                .. seen.Select(row => ToSummary(row, EntryExtras.Nothing, now, mayAnswer: false)),
            ],
            UnseenEntryCount = colliding.Count - seen.Count,
        };
    }

    private async Task<IReadOnlyList<EntryRow>> CollidingRowsAsync(
        VenueCollisionQuery probe,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var windowStart = probe.StartsAt.AddHours(-CalendarDefaults.OpenEndedHours);
        var windowEnd = ProbeEndOf(probe);
        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.VenueId == probe.VenueId)
            .Where(entry =>
                entry.StartsAt < windowEnd
                && (
                    entry.EndsAt == null ? entry.StartsAt > windowStart : entry.EndsAt > windowStart
                )
            )
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, now.AddHours(-CalendarDefaults.OpenEndedHours)))
            .ToListAsync(ct);

        return [.. rows.Where(row => Collides(row, probe))];
    }

    private async Task<IReadOnlyList<EntryRow>> SeenAmongAsync(
        CalendarViewer viewer,
        IReadOnlyList<EntryRow> rows,
        DateOnly today,
        CancellationToken ct
    )
    {
        var entryIds = rows.Select(row => row.CalendarEntryId).ToList();
        var visibleIds = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entryIds.Contains(entry.Id))
            .Where(VisibleTo(viewer.PersonId, viewer.Rights, today))
            .Where(PublishedEvents.IsListedEntry)
            .Select(entry => entry.Id)
            .ToHashSetAsync(ct);
        var ties = await _dbContext.CalendarTiesOfAsync(viewer.PersonId, today, ct);

        return
        [
            .. rows.Where(row =>
                visibleIds.Contains(row.CalendarEntryId) && ties.Sees(FactsOf(row), viewer.Rights)
            ),
        ];
    }
}
