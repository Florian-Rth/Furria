using Furria.Core.Club;
using Furria.Core.Events;

namespace Furria.Core.Halls;

public sealed class TablePlan : ITimestamped
{
    public int CalendarEntryId { get; set; }

    public int HallId { get; set; }

    public TablePlanDocument Document { get; set; } = TablePlanDocument.Empty;

    public int Version { get; set; }

    public int Tables { get; set; }

    public int Chairs { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Event? Event { get; set; }

    public Hall? Hall { get; set; }
}
