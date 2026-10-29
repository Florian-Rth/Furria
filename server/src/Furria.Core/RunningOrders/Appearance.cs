using Furria.Core.Club;

namespace Furria.Core.RunningOrders;

public sealed class Appearance
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int ActId { get; set; }

    public int? Position { get; set; }

    public bool IsPinned { get; set; }

    public int? BlockKey { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public Act? Act { get; set; }

    public ICollection<AppearanceCastChange> CastChanges { get; set; } = [];
}
