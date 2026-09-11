using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class MembershipStateCalculator
{
    [Pure]
    public static MembershipState Resolve(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pausesOfRunningPeriod,
        DateOnly today
    )
    {
        if (!HasBegun(periods, today))
            return MembershipState.None;

        if (!periods.Any(period => period.IsRunningOn(today)))
            return MembershipState.Ended;

        return pausesOfRunningPeriod.Any(pause => pause.Contains(ClubSession.YearOf(today)))
            ? MembershipState.Paused
            : MembershipState.Active;
    }

    [Pure]
    public static DateOnly? MemberSince(IReadOnlyCollection<DatePeriod> periods, DateOnly today) =>
        periods
            .Where(period => period.Start <= today)
            .Select(period => (DateOnly?)period.Start)
            .Min();

    [Pure]
    private static bool HasBegun(IReadOnlyCollection<DatePeriod> periods, DateOnly today) =>
        periods.Any(period => period.Start <= today);
}
