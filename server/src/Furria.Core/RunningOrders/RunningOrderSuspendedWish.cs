namespace Furria.Core.RunningOrders;

public sealed class RunningOrderSuspendedWish
{
    public int CalendarEntryId { get; set; }

    public int ActWishId { get; set; }

    public RunningOrder? RunningOrder { get; set; }

    public ActWish? ActWish { get; set; }
}
