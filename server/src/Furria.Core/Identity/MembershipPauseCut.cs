using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Identity;

public static class MembershipPauseCut
{
    [Pure]
    public static IReadOnlyList<MembershipPause> LyingAfter(
        IEnumerable<MembershipPause> pauses,
        DateOnly lastDay
    )
    {
        var lastSessionYear = ClubSession.YearOf(lastDay);

        return [.. pauses.Where(pause => pause.FirstSessionYear > lastSessionYear)];
    }

    public static void CutAt(IEnumerable<MembershipPause> pauses, DateOnly lastDay)
    {
        var lastSessionYear = ClubSession.YearOf(lastDay);

        foreach (var pause in pauses.Where(pause => ReachesPast(pause, lastSessionYear)))
        {
            pause.LastSessionYear = lastSessionYear;
        }
    }

    [Pure]
    private static bool ReachesPast(MembershipPause pause, int lastSessionYear) =>
        pause.FirstSessionYear <= lastSessionYear
        && (pause.LastSessionYear is null || pause.LastSessionYear > lastSessionYear);
}
