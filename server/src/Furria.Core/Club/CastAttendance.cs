using System.Diagnostics.Contracts;
using System.Linq.Expressions;

namespace Furria.Core.Club;

public static class CastAttendance
{
    public const CalendarEntryKind Kind = CalendarEntryKind.Training;

    public static readonly Expression<Func<CalendarEntry, bool>> AsksItsCast = entry =>
        entry.Kind == Kind
        && entry.AsksForResponse
        && entry.Audience != CalendarEntryAudience.People;

    [Pure]
    public static bool AsksTheCastOn(CalendarEntryKind kind, bool asksForResponse) =>
        kind == Kind && asksForResponse;

    [Pure]
    public static int SessionYearOf(DateTimeOffset startsAt) =>
        ClubSession.RelevantYearOf(ClubClock.DayOf(startsAt));

    [Pure]
    public static bool AsksTheCast(
        CalendarEntryKind kind,
        bool asksForResponse,
        IEnumerable<int> groupIds,
        int castSessionYear,
        IReadOnlySet<GroupSession> actSessions
    ) =>
        AsksTheCastOn(kind, asksForResponse)
        && groupIds.Any(groupId =>
            actSessions.Contains(new GroupSession(groupId, castSessionYear))
        );
}
