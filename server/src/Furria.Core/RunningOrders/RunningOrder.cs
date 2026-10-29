using Furria.Core.Club;

namespace Furria.Core.RunningOrders;

public sealed class RunningOrder : ITimestamped
{
    public int CalendarEntryId { get; set; }

    public int Version { get; set; }

    public DateTimeOffset? ConfirmedAt { get; set; }

    public bool ChangedSinceConfirmed { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public ICollection<RunningOrderLine> Lines { get; set; } = [];

    public ICollection<RunningOrderRule> Rules { get; set; } = [];

    public ICollection<RunningOrderSuspendedWish> SuspendedWishes { get; set; } = [];
}
