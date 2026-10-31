using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CastAttendance
{
    public static readonly IReadOnlyList<CalendarEntryKind> Kinds =
    [
        CalendarEntryKind.Training,
        CalendarEntryKind.Rehearsal,
    ];

    [Pure]
    public static bool AsksTheCastOn(CalendarEntryKind kind) => Kinds.Contains(kind);

    [Pure]
    public static int SessionYearOf(DateTimeOffset startsAt) =>
        ClubSession.RelevantYearOf(ClubClock.DayOf(startsAt));

    [Pure]
    public static bool AsksTheCast(
        CalendarEntryKind kind,
        IEnumerable<int> groupIds,
        int castSessionYear,
        IReadOnlySet<GroupSession> actSessions
    ) =>
        AsksTheCastOn(kind)
        && groupIds.Any(groupId =>
            actSessions.Contains(new GroupSession(groupId, castSessionYear))
        );
}
