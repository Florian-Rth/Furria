namespace Furria.Core.RunningOrders;

public sealed record RunningOrderLineDraft
{
    public required int ActId { get; init; }

    public required int? Position { get; init; }

    public required bool IsPinned { get; init; }

    public required int? BlockKey { get; init; }
}
