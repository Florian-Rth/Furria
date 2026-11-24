using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Assistant;

public static class ClubAssistantMonth
{
    [Pure]
    public static DateTimeOffset StartOf(DateOnly day) =>
        ClubClock.StartOfDay(new DateOnly(day.Year, day.Month, 1));
}
