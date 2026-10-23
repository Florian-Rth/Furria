namespace Furria.Core.RunningOrders;

public sealed record ProposedMove
{
    public required LineKey Line { get; init; }

    public required int? From { get; init; }

    public required int To { get; init; }

    public required IReadOnlyList<ResolvedFinding> Resolved { get; init; }

    public required IReadOnlyList<int> RoomFor { get; init; }
}
