using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Events;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    public async Task<IReadOnlyList<CalendarEntrySummary>> GetEntriesSeenByAsync(
        CalendarSightQuery query,
        CancellationToken ct
    )
    {
        var viewer = new CalendarViewer(query.PersonId, query.Rights);
        var now = _timeProvider.GetUtcNow();
        var (rows, ties) = await SeenRowsAsync(
            viewer,
            new SeenWindow(query.From, query.To, ClubOwnedOnly: false, OwnerGroupId: null),
            now,
            ct
        );
        var extras = await ExtrasOfAsync(viewer.PersonId, rows, now, ct);

        return
        [
            .. rows.Select(row =>
                ToSummary(row, extras, now, MayAnswer(row, ties, OrganisedOwners.Nobody))
            ),
        ];
    }

    public async Task<CalendarEntrySummary?> GetEntrySeenByAsync(
        CalendarEntrySightQuery query,
        CancellationToken ct
    )
    {
        var viewer = new CalendarViewer(query.PersonId, query.Rights);
        if (await SeenRowAsync(viewer, query.CalendarEntryId, ct) is not var (row, ties))
            return null;

        var now = _timeProvider.GetUtcNow();
        var extras = await ExtrasOfAsync(viewer.PersonId, [row], now, ct);
        return ToSummary(row, extras, now, MayAnswer(row, ties, OrganisedOwners.Nobody));
    }

    private async Task<(EntryRow Row, CalendarTies Ties)?> SeenRowAsync(
        CalendarViewer viewer,
        int calendarEntryId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var row = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.Id == calendarEntryId)
            .Where(VisibleTo(viewer.PersonId, viewer.Rights, today))
            .Where(PublishedEvents.IsListedEntry)
            .Select(RowProjection(now, now.AddHours(-CalendarDefaults.OpenEndedHours)))
            .SingleOrDefaultAsync(ct);
        if (row is null)
            return null;

        var ties = await _dbContext.CalendarTiesOfAsync(viewer.PersonId, today, ct);
        return ties.Sees(FactsOf(row), viewer.Rights) ? (row, ties) : null;
    }
}
