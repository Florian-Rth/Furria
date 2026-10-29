namespace Furria.Core.RunningOrders.Planning;

internal sealed class PlanUnit
{
    public int Index { get; }

    public IReadOnlyList<PlanLine> Lines { get; }

    public int FirstActId { get; }

    public PlanUnit(int index, IReadOnlyList<PlanLine> lines)
    {
        Index = index;
        Lines = lines;
        FirstActId = lines[0].Key.ActId;
    }
}
