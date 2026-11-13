using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Events;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private static readonly IReadOnlyDictionary<int, CalendarEntrySummary> NoLendingEntries =
        new Dictionary<int, CalendarEntrySummary>();

    public async Task<IReadOnlyDictionary<int, CalendarEntrySummary>> GetLendingEntriesAsync(
        int viewerAccountId,
        IReadOnlyCollection<int> calendarEntryIds,
        CancellationToken ct
    )
    {
        var ids = calendarEntryIds.Distinct().ToList();
        if (ids.Count == 0 || await ViewerOfAsync(viewerAccountId, ct) is not { } viewer)
            return NoLendingEntries;

        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => ids.Contains(entry.Id))
            .Where(entry =>
                entry.Audience == CalendarEntryAudience.Club
                || entry.Audience == CalendarEntryAudience.Groups
            )
            .Where(VisibleTo(viewer.PersonId, viewer.Rights, today))
            .Where(PublishedEvents.IsListedEntry)
            .Select(RowProjection(now, now.AddHours(-CalendarDefaults.OpenEndedHours)))
            .ToListAsync(ct);
        var ties = await _dbContext.CalendarTiesOfAsync(viewer.PersonId, today, ct);
        rows = [.. rows.Where(row => ties.Sees(FactsOf(row), viewer.Rights))];

        var extras = await ExtrasOfAsync(viewer.PersonId, rows, now, ct);
        var organised = await OwnersRunByAsync(viewerAccountId, rows, ct);
        var entries = new Dictionary<int, CalendarEntrySummary>();
        foreach (var row in rows)
        {
            var concern = await ConcernOfAsync(
                row,
                extras,
                new ConcernViewer(viewer.PersonId, organised.Includes(row.OwnerGroupId)),
                today,
                ct
            );
            entries[row.CalendarEntryId] = ToSummary(
                row,
                concern.Extras,
                now,
                MayAnswer(row, ties, organised),
                concern.Roll
            );
        }

        return entries;
    }

    private async Task<OrganisedOwners> OwnersRunByAsync(
        int viewerAccountId,
        IEnumerable<EntryRow> rows,
        CancellationToken ct
    )
    {
        var groupIds = new HashSet<int>();
        var club = false;

        foreach (var owner in rows.Select(row => row.OwnerGroupId).Distinct().ToList())
        {
            if (!await MayOwnAsync(viewerAccountId, owner, ct))
                continue;

            if (owner is { } groupId)
                groupIds.Add(groupId);
            else
                club = true;
        }

        return new OrganisedOwners(groupIds, club);
    }

    private Task DropLoansAsync(int calendarEntryId, EntryLoanEnd end, CancellationToken ct) =>
        end switch
        {
            EntryLoanEnd.Everything => _dbContext
                .AnnouncementBorrowedAddOns.Where(loan => loan.CalendarEntryId == calendarEntryId)
                .ExecuteDeleteAsync(ct),
            EntryLoanEnd.Attendance => _dbContext
                .AnnouncementBorrowedAddOns.Where(loan =>
                    loan.CalendarEntryId == calendarEntryId
                    && loan.Kind == AnnouncementAddOnKind.Attendance
                )
                .ExecuteDeleteAsync(ct),
            _ => Task.CompletedTask,
        };

    private enum EntryLoanEnd
    {
        Nothing,
        Attendance,
        Everything,
    }
}
