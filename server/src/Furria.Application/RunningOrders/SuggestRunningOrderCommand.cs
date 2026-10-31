namespace Furria.Application.RunningOrders;

public sealed record SuggestRunningOrderCommand
{
    public required int EventId { get; init; }

    public required RunningOrderStateCommand State { get; init; }

    public required IReadOnlyList<int> SeedActIds { get; init; }

    public required TimeSpan SearchTime { get; init; }
}
