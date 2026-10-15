using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class SessionCount
{
    [Pure]
    public static int Of(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pauses,
        int sessionYear
    )
    {
        if (periods.Count == 0)
            return 0;

        var firstYear = periods.Min(period => ClubSession.YearOf(period.Start));

        return firstYear > sessionYear
            ? 0
            : Enumerable
                .Range(firstYear, sessionYear - firstYear + 1)
                .Count(year => Counts(year, periods, pauses));
    }

    [Pure]
    internal static bool Counts(
        int sessionYear,
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pauses
    ) =>
        periods.Any(period => period.Overlaps(DaysOf(sessionYear)))
        && !pauses.Any(pause => pause.Contains(sessionYear));

    [Pure]
    private static DatePeriod DaysOf(int sessionYear) =>
        new()
        {
            Start = ClubSession.OpeningOf(sessionYear),
            End = ClubSession.AshWednesdayOf(sessionYear + 1),
        };
}
