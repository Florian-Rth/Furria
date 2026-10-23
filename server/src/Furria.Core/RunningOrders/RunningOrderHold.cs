namespace Furria.Core.RunningOrders;

public sealed record RunningOrderHold
{
    public required RunningOrderHoldKind Kind { get; init; }

    public required LineKey? Line { get; init; }

    public required int? BlockKey { get; init; }

    public required int? RuleIndex { get; init; }

    public required int? ActWishId { get; init; }

    public required int ConflictsWithout { get; init; }
}
