using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarKindAudience
{
    [Pure]
    public static bool Admits(CalendarEntryKind kind, CalendarEntryAudience audience) =>
        kind != CalendarEntryKind.Training || audience != CalendarEntryAudience.Club;
}
