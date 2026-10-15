using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class SessionOrdinal
{
    [Pure]
    public static int? Of(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pauses,
        int sessionYear
    ) =>
        SessionCount.Counts(sessionYear, periods, pauses)
            ? SessionCount.Of(periods, pauses, sessionYear)
            : null;
}
