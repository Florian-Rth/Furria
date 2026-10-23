namespace Furria.Application.RunningOrders;

public sealed record RunningOrderDetails
{
    public required int EventId { get; init; }

    public required int Version { get; init; }

    public required DateTimeOffset? ConfirmedAt { get; init; }

    public required bool ChangedSinceConfirmed { get; init; }

    public required IReadOnlyList<RunningOrderLineDetails> Lines { get; init; }

    public required IReadOnlyList<RunningOrderRuleDetails> Rules { get; init; }

    public required IReadOnlyList<RunningOrderActWishDetails> ActWishes { get; init; }

    public required IReadOnlyList<RunningOrderFindingDetails> Findings { get; init; }
}
