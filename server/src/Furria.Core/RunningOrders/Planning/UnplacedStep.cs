namespace Furria.Core.RunningOrders.Planning;

internal sealed class UnplacedStep : ICostStep
{
    public RunningOrderCostStep Step => RunningOrderCostStep.Unplaced;

    public int Weight => CostWeights.Hint;

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts) => 0;

    public int ViolationsOf(CompleteOrder order) => order.FindingsOfKind(FindingKind.Unplaced);
}
