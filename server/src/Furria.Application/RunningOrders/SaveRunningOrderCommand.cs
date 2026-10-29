namespace Furria.Application.RunningOrders;

public sealed record SaveRunningOrderCommand
{
    public required int EventId { get; init; }

    public required int? Version { get; init; }

    public required RunningOrderStateCommand State { get; init; }
}
