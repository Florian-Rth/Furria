using System.Diagnostics;
using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private Task<AddOnHost?> PollHostAsync(int pollId, CancellationToken ct) =>
        HostOfAsync(
            _dbContext
                .Polls.Where(poll => poll.Id == pollId)
                .Select(poll => new AddOnHostRow(
                    poll.CalendarEntryId,
                    poll.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)poll.CalendarEntry.StartsAt
                )),
            ct
        );

    private Task<AddOnHost?> SignUpListHostAsync(int signUpListId, CancellationToken ct) =>
        HostOfAsync(
            _dbContext
                .SignUpLists.Where(list => list.Id == signUpListId)
                .Select(list => new AddOnHostRow(
                    list.CalendarEntryId,
                    list.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)list.CalendarEntry.StartsAt
                )),
            ct
        );

    private Task<AddOnHost?> SignUpLineHostAsync(int lineId, CancellationToken ct) =>
        HostOfAsync(
            _dbContext
                .SignUpLines.Where(line => line.Id == lineId)
                .Select(line => new AddOnHostRow(
                    line.SignUpList!.CalendarEntryId,
                    line.SignUpList.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)line.SignUpList.CalendarEntry.StartsAt
                )),
            ct
        );

    private async Task<AddOnHost?> HostOfAsync(
        IQueryable<AddOnHostRow> rows,
        CancellationToken ct
    ) => HostOfRow(await rows.AsNoTracking().SingleOrDefaultAsync(ct));

    private Task<bool> MayManageAsync(int actorAccountId, AddOnHost host, CancellationToken ct) =>
        host switch
        {
            CalendarEntryAddOnHost entry => MayOwnAsync(actorAccountId, entry.OwnerGroupId, ct),
            _ => throw new UnreachableException(),
        };

    private async Task<IReadOnlySet<int>> ConcernedIdsOfAsync(
        AddOnHost host,
        CancellationToken ct
    ) =>
        host switch
        {
            CalendarEntryAddOnHost entry => await ConcernedIdsOfAsync(
                (
                    await _dbContext
                        .CalendarEntries.AsNoTracking()
                        .Where(row => row.Id == entry.CalendarEntryId)
                        .Select(EntryFactsRows.Projection)
                        .SingleAsync(ct)
                ).ToFacts(),
                ClubClock.Today(_timeProvider),
                ct
            ),
            _ => throw new UnreachableException(),
        };

    [Pure]
    private static AddOnHost? HostOfRow(AddOnHostRow? row) =>
        row is { CalendarEntryId: { } calendarEntryId, StartsAt: { } startsAt }
            ? new CalendarEntryAddOnHost(calendarEntryId, row.OwnerGroupId, startsAt)
            : null;

    private sealed record AddOnHostRow(
        int? CalendarEntryId,
        int? OwnerGroupId,
        DateTimeOffset? StartsAt
    );
}
