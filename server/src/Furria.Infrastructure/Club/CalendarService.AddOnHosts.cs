using System.Diagnostics;
using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string NotManagedAnnouncementMessage = "Diesen Aushang darfst du nicht pflegen.";

    private Task<AddOnHost?> PollHostAsync(
        int pollId,
        AddOnHostKind hostKind,
        CancellationToken ct
    ) =>
        HostOfAsync(
            _dbContext
                .Polls.Where(poll => poll.Id == pollId)
                .Select(poll => new AddOnHostRow(
                    poll.CalendarEntryId,
                    poll.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)poll.CalendarEntry.StartsAt,
                    poll.AnnouncementId,
                    poll.Announcement!.AuthorPersonId,
                    poll.Announcement.ValidUntil
                )),
            hostKind,
            ct
        );

    private Task<AddOnHost?> SignUpListHostAsync(
        int signUpListId,
        AddOnHostKind hostKind,
        CancellationToken ct
    ) =>
        HostOfAsync(
            _dbContext
                .SignUpLists.Where(list => list.Id == signUpListId)
                .Select(list => new AddOnHostRow(
                    list.CalendarEntryId,
                    list.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)list.CalendarEntry.StartsAt,
                    list.AnnouncementId,
                    list.Announcement!.AuthorPersonId,
                    list.Announcement.ValidUntil
                )),
            hostKind,
            ct
        );

    private Task<AddOnHost?> SignUpLineHostAsync(
        int lineId,
        AddOnHostKind hostKind,
        CancellationToken ct
    ) =>
        HostOfAsync(
            _dbContext
                .SignUpLines.Where(line => line.Id == lineId)
                .Select(line => new AddOnHostRow(
                    line.SignUpList!.CalendarEntryId,
                    line.SignUpList.CalendarEntry!.OwnerGroupId,
                    (DateTimeOffset?)line.SignUpList.CalendarEntry.StartsAt,
                    line.SignUpList.AnnouncementId,
                    line.SignUpList.Announcement!.AuthorPersonId,
                    line.SignUpList.Announcement.ValidUntil
                )),
            hostKind,
            ct
        );

    private async Task<AddOnHost?> HostOfAsync(
        IQueryable<AddOnHostRow> rows,
        AddOnHostKind hostKind,
        CancellationToken ct
    ) => HostOfRow(await rows.AsNoTracking().SingleOrDefaultAsync(ct), hostKind);

    private Task<bool> MayManageAsync(int actorAccountId, AddOnHost host, CancellationToken ct) =>
        host switch
        {
            CalendarEntryAddOnHost entry => MayOwnAsync(actorAccountId, entry.OwnerGroupId, ct),
            AnnouncementAddOnHost announcement => _authorizer.MayManageAnnouncementAsync(
                actorAccountId,
                announcement.AuthorPersonId,
                ct
            ),
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
            AnnouncementAddOnHost => await _dbContext.AnnouncementConcernedIdsAsync(
                ClubClock.Today(_timeProvider),
                ct
            ),
            _ => throw new UnreachableException(),
        };

    [Pure]
    private static string NotManagedMessageOf(AddOnHost host) =>
        host is AnnouncementAddOnHost ? NotManagedAnnouncementMessage : NotOwnedMessage;

    [Pure]
    private static AddOnHost? HostOfRow(AddOnHostRow? row, AddOnHostKind hostKind) =>
        (row, hostKind) switch
        {
            (
                { CalendarEntryId: { } calendarEntryId, StartsAt: { } startsAt },
                AddOnHostKind.CalendarEntry
            ) => new CalendarEntryAddOnHost(calendarEntryId, row.OwnerGroupId, startsAt),
            ({ AnnouncementId: { } announcementId }, AddOnHostKind.Announcement) =>
                new AnnouncementAddOnHost(announcementId, row.AuthorPersonId, row.ValidUntil),
            _ => null,
        };

    private sealed record AddOnHostRow(
        int? CalendarEntryId,
        int? OwnerGroupId,
        DateTimeOffset? StartsAt,
        int? AnnouncementId,
        int? AuthorPersonId,
        DateOnly? ValidUntil
    );
}
