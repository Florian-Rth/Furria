namespace Furria.Core.RunningOrders.Planning;

internal sealed class NoChangeoverStep : ICostStep
{
    public RunningOrderCostStep Step => RunningOrderCostStep.NoChangeover;

    public int Weight => CostWeights.Conflict;

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts) =>
        partial.Count >= 2 && Casts.Share(partial.FromEnd(2), partial.Last) ? 1 : 0;

    public int ViolationsOf(CompleteOrder order) => order.FindingsOfKind(FindingKind.NoChangeover);
}
