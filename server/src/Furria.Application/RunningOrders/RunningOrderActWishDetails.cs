namespace Furria.Application.RunningOrders;

public sealed record RunningOrderActWishDetails
{
    public required ActWishDetails Wish { get; init; }

    public required bool IsSuspended { get; init; }
}
