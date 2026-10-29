namespace Furria.Core.RunningOrders.Planning;

internal sealed class TightChangeoverStep : ICostStep
{
    public RunningOrderCostStep Step => RunningOrderCostStep.TightChangeover;

    public int Weight => CostWeights.Hint;

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts) =>
        partial.Count >= 3
        && Casts.ShareBeyond(partial.FromEnd(3), partial.Last, partial.FromEnd(2))
            ? 1
            : 0;

    public int ViolationsOf(CompleteOrder order) =>
        order.FindingsOfKind(FindingKind.TightChangeover);
}
