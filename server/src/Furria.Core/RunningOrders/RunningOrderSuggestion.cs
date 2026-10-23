using System.Diagnostics.Contracts;
using Furria.Core.RunningOrders.Planning;

namespace Furria.Core.RunningOrders;

public static class RunningOrderSuggestion
{
    public const int NodeBudget = 2_400_000;

    [Pure]
    public static RunningOrderProposal ProposalFor(RunningOrderReviewInput input) =>
        ProposalFor(input, NodeBudget);

    [Pure]
    public static RunningOrderProposal ProposalFor(RunningOrderReviewInput input, int nodeBudget)
    {
        var solution = Solution.Of(input, nodeBudget);
        var (holds, isUnavoidable) = HoldSearch.Run(
            input,
            solution,
            nodeBudget / 6 + nodeBudget - solution.NodesUsed
        );

        return ProposalOf(input, solution) with
        {
            Holds = holds,
            HoldsUnavoidable = isUnavoidable,
        };
    }

    [Pure]
    private static RunningOrderProposal ProposalOf(RunningOrderReviewInput input, Solution solution)
    {
        var pipeline = solution.Pipeline;
        var findingsBefore = pipeline.FindingsOf(solution.OriginalOrder);
        var findingsAfter = pipeline.FindingsOf(solution.Order);
        var costsBefore = pipeline.CostsOf(solution.OriginalOrder);
        var costsAfter = pipeline.CostsOf(solution.Order);

        return new RunningOrderProposal
        {
            Order = solution.Order,
            Moves = MovesOf(
                new ChangeoverGaps(input, solution.OriginalOrder, solution.Order),
                findingsBefore,
                findingsAfter
            ),
            ConflictsBefore = Conflicts.Of(findingsBefore),
            HintsBefore = findingsBefore.Count - Conflicts.Of(findingsBefore),
            ConflictsAfter = Conflicts.Of(findingsAfter),
            HintsAfter = findingsAfter.Count - Conflicts.Of(findingsAfter),
            CostBefore = PrimaryOf(costsBefore),
            CostAfter = PrimaryOf(costsAfter),
            RoomBefore = RoomOf(costsBefore),
            RoomAfter = RoomOf(costsAfter),
            Steps =
            [
                .. costsBefore.Zip(
                    costsAfter,
                    (before, after) => new CostStepComparison(before.Step, before.Cost, after.Cost)
                ),
            ],
            Proven = solution.IsProven,
            Holds = [],
            HoldsUnavoidable = false,
        };
    }

    [Pure]
    private static IReadOnlyList<ProposedMove> MovesOf(
        ChangeoverGaps gaps,
        IReadOnlyList<RunningOrderFinding> findingsBefore,
        IReadOnlyList<RunningOrderFinding> findingsAfter
    )
    {
        var resolved = findingsBefore
            .Where(finding => !findingsAfter.Any(after => IsSame(finding, after)))
            .ToList();

        return
        [
            .. gaps
                .Proposed.Select(
                    (key, index) =>
                        new ProposedMove
                        {
                            Line = key,
                            From = IndexOf(gaps.Original, key),
                            To = index,
                            Resolved =
                            [
                                .. resolved
                                    .Where(finding => finding.Lines.Contains(key))
                                    .Select(finding => new ResolvedFinding
                                    {
                                        Kind = finding.Kind,
                                        Lines = finding.Lines,
                                    }),
                            ],
                            RoomFor = gaps.PersonsWithMoreRoomAround(key),
                        }
                )
                .Where(move => move.From != move.To)
                .OrderBy(move => move.From is null)
                .ThenBy(move => move.From)
                .ThenBy(move => move.To),
        ];
    }

    [Pure]
    private static int PrimaryOf(IReadOnlyList<StepCost> costs) =>
        costs
            .Where(cost => cost.Step != RunningOrderCostStep.ChangeoverRoom)
            .Sum(cost => cost.Cost);

    [Pure]
    private static int RoomOf(IReadOnlyList<StepCost> costs) =>
        costs.Single(cost => cost.Step == RunningOrderCostStep.ChangeoverRoom).Cost;

    [Pure]
    private static bool IsSame(RunningOrderFinding first, RunningOrderFinding second) =>
        first.Kind == second.Kind
        && first.RuleId == second.RuleId
        && first.ActWishId == second.ActWishId
        && first
            .Lines.Order(LineKeyComparer.Instance)
            .SequenceEqual(second.Lines.Order(LineKeyComparer.Instance));

    [Pure]
    private static int? IndexOf(IReadOnlyList<LineKey> keys, LineKey key) =>
        keys.Select((candidate, index) => (candidate, index))
            .Where(pair => pair.candidate == key)
            .Select(pair => (int?)pair.index)
            .FirstOrDefault();

    private sealed class LineKeyComparer : IComparer<LineKey>
    {
        public static readonly LineKeyComparer Instance = new();

        public int Compare(LineKey x, LineKey y) => x.ActId.CompareTo(y.ActId);
    }
}
