namespace Furria.Core.RunningOrders.Planning;

internal interface ICostStep
{
    RunningOrderCostStep Step { get; }

    int Weight { get; }

    int BaseViolations(PlanFacts facts);

    int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts);

    int ViolationsOf(CompleteOrder order);
}
