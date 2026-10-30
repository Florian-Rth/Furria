namespace Furria.Core.RunningOrders.Planning;

internal sealed record SearchControl(
    int NodeBudget,
    IReadOnlyList<LineKey> Seed,
    CancellationToken Stop,
    Action<IReadOnlyList<LineKey>>? Improved
)
{
    public static SearchControl Budget(int nodeBudget, CancellationToken stop) =>
        new(nodeBudget, [], stop, null);
}
