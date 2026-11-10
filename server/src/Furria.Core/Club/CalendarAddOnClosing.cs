using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarAddOnClosing
{
    [Pure]
    public static DateTimeOffset ClosesAt(DateTimeOffset? deadline, DateTimeOffset entryStartsAt) =>
        deadline is { } deadlineAt && deadlineAt < entryStartsAt ? deadlineAt : entryStartsAt;

    [Pure]
    public static bool IsClosed(
        DateTimeOffset? closedAt,
        DateTimeOffset? deadline,
        DateTimeOffset entryStartsAt,
        DateTimeOffset now
    ) => closedAt is not null || now >= ClosesAt(deadline, entryStartsAt);

    [Pure]
    public static DateTimeOffset? StampOf(
        DateTimeOffset? deadline,
        DateTimeOffset entryStartsAt,
        DateTimeOffset now
    )
    {
        var closesAt = ClosesAt(deadline, entryStartsAt);

        return now >= closesAt ? closesAt : null;
    }

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
