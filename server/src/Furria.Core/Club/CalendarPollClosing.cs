using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarPollClosing
{
    [Pure]
    public static DateTimeOffset ClosesAt(
        DateTimeOffset? votesUntil,
        DateTimeOffset entryStartsAt
    ) => votesUntil is { } until && until < entryStartsAt ? until : entryStartsAt;

    [Pure]
    public static bool IsClosed(
        DateTimeOffset? closedAt,
        DateTimeOffset? votesUntil,
        DateTimeOffset entryStartsAt,
        DateTimeOffset now
    ) => closedAt is not null || now >= ClosesAt(votesUntil, entryStartsAt);
}
