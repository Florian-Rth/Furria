using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class AddOnLending
{
    [Pure]
    public static bool Lends(CalendarEntryAudience audience) =>
        audience is CalendarEntryAudience.Club or CalendarEntryAudience.Groups;
}
