namespace Furria.Core.RunningOrders.Planning;

internal sealed class SameKindStep : ICostStep
{
    public RunningOrderCostStep Step => RunningOrderCostStep.SameKind;

    public int Weight => CostWeights.Hint;

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts) =>
        !facts.AreSpeechesSpreadByRule
        && partial.Count >= 2
        && partial.FromEnd(2).ActKind == ActKind.Speech
        && partial.Last.ActKind == ActKind.Speech
            ? 1
            : 0;

    public int ViolationsOf(CompleteOrder order) =>
        order.FindingsOfKind(FindingKind.SameKindAdjacent);
}
