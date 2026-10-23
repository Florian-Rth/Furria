namespace Furria.Core.RunningOrders;

public sealed record RunningOrderFinding
{
    public required FindingKind Kind { get; init; }

    public required FindingSeverity Severity { get; init; }

    public required IReadOnlyList<LineKey> Lines { get; init; }

    public required IReadOnlyList<int> PersonIds { get; init; }

    public required int? RuleId { get; init; }

    public required int? ActWishId { get; init; }
}
