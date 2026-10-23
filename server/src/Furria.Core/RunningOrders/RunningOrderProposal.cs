namespace Furria.Core.RunningOrders;

public sealed record RunningOrderProposal
{
    public required IReadOnlyList<LineKey> Order { get; init; }

    public required IReadOnlyList<ProposedMove> Moves { get; init; }

    public required int ConflictsBefore { get; init; }

    public required int HintsBefore { get; init; }

    public required int ConflictsAfter { get; init; }

    public required int HintsAfter { get; init; }

    public required int CostBefore { get; init; }

    public required int CostAfter { get; init; }

    public required int RoomBefore { get; init; }

    public required int RoomAfter { get; init; }

    public required IReadOnlyList<CostStepComparison> Steps { get; init; }

    public required bool Proven { get; init; }

    public required IReadOnlyList<RunningOrderHold> Holds { get; init; }

    public required bool HoldsUnavoidable { get; init; }
}
