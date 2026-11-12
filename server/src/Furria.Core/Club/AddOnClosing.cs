using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class AddOnClosing
{
    [Pure]
    public static DateTimeOffset? ClosesAt(
        DateTimeOffset? deadline,
        DateTimeOffset? hostClosesAt
    ) =>
        (deadline, hostClosesAt) switch
        {
            ({ } own, { } host) => own < host ? own : host,
            ({ } own, null) => own,
            _ => hostClosesAt,
        };

    [Pure]
    public static bool IsClosed(
        DateTimeOffset? closedAt,
        DateTimeOffset? deadline,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset now
    ) => closedAt is not null || StampOf(deadline, hostClosesAt, now) is not null;

    [Pure]
    public static DateTimeOffset? StampOf(
        DateTimeOffset? deadline,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset now
    ) => ClosesAt(deadline, hostClosesAt) is { } closesAt && now >= closesAt ? closesAt : null;

    [Pure]
    public static AddOnClose CloseOf(
        DateTimeOffset? deadline,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset now,
        int? closerPersonId
    ) =>
        StampOf(deadline, hostClosesAt, now) is { } closedAt
            ? new AddOnClose(closedAt, null)
            : new AddOnClose(now, closerPersonId);

    [Pure]
    public static DateTimeOffset EntryEndOf(DateTimeOffset startsAt, DateTimeOffset? endsAt) =>
        endsAt ?? startsAt.AddHours(CalendarDefaults.OpenEndedHours);

    [Pure]
    public static bool IsAttendanceClosed(
        DateTimeOffset entryStartsAt,
        DateTimeOffset? entryEndsAt,
        DateTimeOffset now
    ) => now >= EntryEndOf(entryStartsAt, entryEndsAt);
}
