namespace Furria.Core.RunningOrders.Planning;

internal sealed record SearchOutcome(IReadOnlyList<PlanUnit> Order, bool IsProven, int NodesUsed);
