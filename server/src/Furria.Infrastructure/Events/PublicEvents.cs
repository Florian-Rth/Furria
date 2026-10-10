using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Events;

namespace Furria.Infrastructure.Events;

public static class PublicEvents
{
    [Pure]
    public static Expression<Func<Event, bool>> IsShownAt(DateTimeOffset now)
    {
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);

        return row =>
            row.CalendarEntry!.Venue != null
            && (
                row.CalendarEntry.EndsAt == null
                    ? row.CalendarEntry.StartsAt > openEndedCutoff
                    : row.CalendarEntry.EndsAt > now
            );
    }
}
