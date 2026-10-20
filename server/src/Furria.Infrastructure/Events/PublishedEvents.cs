using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Events;

namespace Furria.Infrastructure.Events;

public static class PublishedEvents
{
    public static readonly Expression<Func<Event, bool>> IsPublished = row =>
        row.PublishedAt != null;

    public static readonly Expression<Func<CalendarEntry, bool>> IsListedEntry = entry =>
        entry.Event == null || entry.Event.PublishedAt != null;
}
