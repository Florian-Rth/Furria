using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public readonly record struct LineKey
{
    public int ActId { get; }

    private LineKey(int actId)
    {
        ActId = actId;
    }

    [Pure]
    public static LineKey OfAct(int actId) => new(actId);
}
