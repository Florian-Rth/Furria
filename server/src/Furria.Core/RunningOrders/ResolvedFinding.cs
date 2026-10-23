namespace Furria.Core.RunningOrders;

public sealed record ResolvedFinding
{
    public required FindingKind Kind { get; init; }

    public required IReadOnlyList<LineKey> Lines { get; init; }
}
