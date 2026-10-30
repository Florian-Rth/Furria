namespace Furria.Core.RunningOrders;

public sealed class LiveDirection
{
    public int CalendarEntryId { get; set; }

    public int? AppearanceId { get; set; }

    public DateTimeOffset StartedAt { get; set; }

    public DateTimeOffset MovedAt { get; set; }

    public RunningOrder? RunningOrder { get; set; }

    public Appearance? Appearance { get; set; }
}
