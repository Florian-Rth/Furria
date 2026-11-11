using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class CalendarReminderRecords
{
    internal static async Task<IReadOnlySet<int>> ReminderAnsweredIdsAsync(
        this AppDbContext dbContext,
        CalendarEntryAddOnKind kind,
        int addOnId,
        CancellationToken ct
    )
    {
        var answered = kind switch
        {
            CalendarEntryAddOnKind.Attendance => dbContext
                .AttendanceResponses.Where(response => response.CalendarEntryId == addOnId)
                .Select(response => response.PersonId),
            CalendarEntryAddOnKind.Poll => dbContext
                .CalendarPollVotes.Where(vote => vote.PollId == addOnId)
                .Select(vote => vote.PersonId),
            _ => dbContext
                .CalendarSignUpLines.Where(line => line.SignUpListId == addOnId)
                .Select(line => line.PersonId),
        };

        return (await answered.Distinct().ToListAsync(ct)).ToHashSet();
    }

    internal static async Task<IReadOnlySet<int>?> OpenReminderAnsweredIdsAsync(
        this AppDbContext dbContext,
        CalendarEntryAddOnKind kind,
        int addOnId,
        CancellationToken ct
    )
    {
        var isOpen = kind switch
        {
            CalendarEntryAddOnKind.Attendance => await dbContext.CalendarEntries.AnyAsync(
                entry => entry.Id == addOnId && entry.AsksForResponse,
                ct
            ),
            CalendarEntryAddOnKind.Poll => await dbContext.CalendarPolls.AnyAsync(
                poll => poll.Id == addOnId && poll.ClosedAt == null,
                ct
            ),
            _ => await dbContext.CalendarSignUpLists.AnyAsync(
                list => list.Id == addOnId && list.ClosedAt == null,
                ct
            ),
        };

        return isOpen ? await dbContext.ReminderAnsweredIdsAsync(kind, addOnId, ct) : null;
    }
}
