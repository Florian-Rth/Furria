using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Identity;

public sealed record RelevantSessionDetails
{
    public required int StartYear { get; init; }

    public required int Ordinal { get; init; }

    [Pure]
    public static RelevantSessionDetails? Of(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pauses,
        DateOnly today
    )
    {
        var startYear = ClubSession.RelevantYearOf(today);

        return SessionOrdinal.Of(periods, pauses, startYear) is { } ordinal
            ? new RelevantSessionDetails { StartYear = startYear, Ordinal = ordinal }
            : null;
    }
}
