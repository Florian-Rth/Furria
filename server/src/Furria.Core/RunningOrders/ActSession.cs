using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.RunningOrders;

public static class ActSession
{
    [Pure]
    public static bool IsTimeless(ActKind? kind) => kind is null or ActKind.Point;

    [Pure]
    public static ActSessionProblem? ProblemOf(ActKind? kind, int? requested, DateOnly today) =>
        requested is not { } year ? null
        : IsTimeless(kind) ? ActSessionProblem.SessionOnTimelessAct
        : IsClosed(year, today) ? ActSessionProblem.PastSession
        : null;

    [Pure]
    public static int? YearFor(ActKind? kind, int? requested, DateOnly today) =>
        IsTimeless(kind) ? null : requested ?? ClubSession.RelevantYearOf(today);

    [Pure]
    public static bool IsClosed(int? sessionYear, DateOnly today) =>
        sessionYear is { } year && year < ClubSession.RelevantYearOf(today);

    [Pure]
    public static AppearanceSessionProblem? AppearanceProblemOf(
        int? sessionYear,
        DateOnly eveningDay,
        DateOnly today
    ) =>
        sessionYear is not { } year ? null
        : IsClosed(year, today) ? AppearanceSessionProblem.SessionEnded
        : year != ClubSession.RelevantYearOf(eveningDay) ? AppearanceSessionProblem.OtherSession
        : null;

    [Pure]
    public static DateOnly CastFreezeDayOf(int sessionYear) =>
        ClubSession.AshWednesdayOf(sessionYear + 1);
}
