using Furria.Core.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class CalendarReminderRecords
{
    internal static IQueryable<Account> PushableAccounts(this AppDbContext dbContext) =>
        dbContext
            .Users.AsNoTracking()
            .Where(account => !account.IsDisabled && account.PersonId != null)
            .Where(account =>
                dbContext.PushSubscriptions.Any(device => device.AccountId == account.Id)
            );

    internal static async Task<IReadOnlySet<int>> ReachablePersonIdsAsync(
        this AppDbContext dbContext,
        IReadOnlySet<int> personIds,
        int? exceptPersonId,
        CancellationToken ct
    )
    {
        var reachable = await dbContext
            .PushableAccounts()
            .Where(account => personIds.Contains(account.PersonId!.Value))
            .Where(account => account.PersonId != exceptPersonId)
            .Select(account => account.PersonId!.Value)
            .Distinct()
            .ToListAsync(ct);

        return reachable.ToHashSet();
    }

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
                .PollVotes.Where(vote => vote.PollId == addOnId)
                .Select(vote => vote.PersonId),
            _ => dbContext
                .SignUpLines.Where(line => line.SignUpListId == addOnId)
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
            CalendarEntryAddOnKind.Poll => await dbContext.Polls.AnyAsync(
                poll => poll.Id == addOnId && poll.ClosedAt == null,
                ct
            ),
            _ => await dbContext.SignUpLists.AnyAsync(
                list => list.Id == addOnId && list.ClosedAt == null,
                ct
            ),
        };

        return isOpen ? await dbContext.ReminderAnsweredIdsAsync(kind, addOnId, ct) : null;
    }
}
