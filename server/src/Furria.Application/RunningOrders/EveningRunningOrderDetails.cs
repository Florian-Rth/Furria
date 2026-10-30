namespace Furria.Application.RunningOrders;

public sealed record EveningRunningOrderDetails
{
    public required int EventId { get; init; }

    public required bool IsConfirmed { get; init; }

    public required IReadOnlyList<EveningRunningOrderLineDetails> Lines { get; init; }
}
