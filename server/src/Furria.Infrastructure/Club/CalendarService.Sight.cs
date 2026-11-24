using Furria.Application.Club;

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
        var (rows, _) = await SeenRowsAsync(
            viewer,
            new SeenWindow(query.From, query.To, ClubOwnedOnly: false, OwnerGroupId: null),
            now,
            ct
        );
        var extras = await ExtrasOfAsync(viewer.PersonId, rows, now, ct);

        return [.. rows.Select(row => ToSummary(row, extras, now, mayAnswer: false))];
    }
}
