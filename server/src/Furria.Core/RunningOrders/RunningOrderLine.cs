namespace Furria.Core.RunningOrders;

public sealed class RunningOrderLine
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int ActId { get; set; }

    public int? Position { get; set; }

    public bool IsPinned { get; set; }

    public int? BlockKey { get; set; }

    public RunningOrder? RunningOrder { get; set; }

    public Act? Act { get; set; }
}
