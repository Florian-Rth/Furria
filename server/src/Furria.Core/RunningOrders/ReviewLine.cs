namespace Furria.Core.RunningOrders;

public sealed record ReviewLine
{
    public required LineKey Key { get; init; }

    public required ActKind? ActKind { get; init; }

    public required bool HasGroup { get; init; }

    public required int? Position { get; init; }

    public required bool IsPinned { get; init; }

    public required int? BlockKey { get; init; }

    public required IReadOnlyList<ReviewCastMember> Cast { get; init; }
}
