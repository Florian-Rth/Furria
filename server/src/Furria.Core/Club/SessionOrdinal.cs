using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class SessionOrdinal
{
    [Pure]
    public static int? Of(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pauses,
        int sessionYear
    )
    {
        if (!Counts(sessionYear, periods, pauses))
            return null;

        var firstYear = periods.Min(period => ClubSession.YearOf(period.Start));

        return Enumerable
            .Range(firstYear, sessionYear - firstYear + 1)
            .Count(year => Counts(year, periods, pauses));
    }

    [Pure]
    private static bool Counts(
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
            End = ClubSession.OpeningOf(sessionYear + 1).AddDays(-1),
        };
}
