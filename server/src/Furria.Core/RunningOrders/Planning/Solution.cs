using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class Solution
{
    public RunningOrderCostPipeline Pipeline { get; }

    public IReadOnlyList<LineKey> OriginalOrder { get; }

    public IReadOnlyList<LineKey> Order { get; }

    public bool IsProven { get; }

    public int NodesUsed { get; }

    private Solution(RunningOrderCostPipeline pipeline, UnitLayout layout, SearchOutcome outcome)
    {
        Pipeline = pipeline;
        OriginalOrder = KeysOf(layout.CurrentOrder);
        Order = KeysOf(outcome.Order);
        IsProven = outcome.IsProven;
        NodesUsed = outcome.NodesUsed;
    }

    public static Solution Of(RunningOrderReviewInput input, SearchControl control)
    {
        var pipeline = RunningOrderCostPipeline.For(input);
        var layout = UnitLayout.Of(input, pipeline.Facts);

        return new Solution(pipeline, layout, OrderSearch.Run(pipeline, layout, control));
    }

    [Pure]
    public static IReadOnlyList<LineKey> OriginalOrderOf(RunningOrderReviewInput input) =>
        KeysOf(UnitLayout.Of(input, RunningOrderCostPipeline.For(input).Facts).CurrentOrder);

    [Pure]
    public int ConflictsAfter() => Conflicts.Of(Pipeline.FindingsOf(Order));

    [Pure]
    public static IReadOnlyList<LineKey> KeysOf(IReadOnlyList<PlanUnit> units) =>
        [.. units.SelectMany(unit => unit.Lines).Select(line => line.Key)];
}
