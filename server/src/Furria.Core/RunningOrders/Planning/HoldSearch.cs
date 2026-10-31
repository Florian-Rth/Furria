using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class HoldSearch
{
    public static (IReadOnlyList<RunningOrderHold> Holds, bool IsUnavoidable) Run(
        RunningOrderReviewInput input,
        Solution solution,
        int nodeBudget,
        CancellationToken stop
    )
    {
        var conflicts = solution.ConflictsAfter();
        if (conflicts == 0 || stop.IsCancellationRequested)
            return ([], false);

        var planned = PlannedAs(input, solution.Order);
        var relaxations = RelaxationsOf(planned);
        var holds = new List<RunningOrderHold>();
        var isEverySolveProven = solution.IsProven;
        for (var index = 0; index < relaxations.Count; index++)
        {
            var share = nodeBudget / (relaxations.Count - index);
            if (share == 0)
            {
                isEverySolveProven = false;
                continue;
            }

            var (hold, relaxed) = relaxations[index];
            var without = Solution.Of(relaxed, SearchControl.Budget(share, stop));
            nodeBudget -= without.NodesUsed;
            isEverySolveProven &= without.IsProven;
            var conflictsWithout = without.ConflictsAfter();
            if (conflictsWithout < conflicts)
                holds.Add(hold with { ConflictsWithout = conflictsWithout });
        }

        return (
            [.. holds.OrderBy(hold => hold.ConflictsWithout)],
            holds.Count == 0 && isEverySolveProven && !stop.IsCancellationRequested
        );
    }

    [Pure]
    private static RunningOrderReviewInput PlannedAs(
        RunningOrderReviewInput input,
        IReadOnlyList<LineKey> order
    )
    {
        var positions = order
            .Select((key, index) => (key, index))
            .ToDictionary(pair => pair.key, pair => pair.index);

        return input with
        {
            Lines = [.. input.Lines.Select(line => line with { Position = positions[line.Key] })],
        };
    }

    [Pure]
    private static IReadOnlyList<(
        RunningOrderHold Hold,
        RunningOrderReviewInput Relaxed
    )> RelaxationsOf(RunningOrderReviewInput planned)
    {
        var placed = planned.Lines.OrderBy(line => line.Position).ToList();

        return
        [
            .. placed
                .Where(line => line.IsPinned)
                .Select(line =>
                    (
                        HoldOf(RunningOrderHoldKind.Pin) with
                        {
                            Line = line.Key,
                        },
                        WithLines(
                            planned,
                            candidate =>
                                candidate.Key == line.Key
                                    ? candidate with
                                    {
                                        IsPinned = false,
                                    }
                                    : candidate
                        )
                    )
                ),
            .. placed
                .Where(line => line.BlockKey is not null)
                .DistinctBy(line => line.BlockKey)
                .Select(line =>
                    (
                        HoldOf(RunningOrderHoldKind.Block) with
                        {
                            Line = line.Key,
                            BlockKey = line.BlockKey,
                        },
                        WithLines(
                            planned,
                            candidate =>
                                candidate.BlockKey == line.BlockKey
                                    ? candidate with
                                    {
                                        BlockKey = null,
                                    }
                                    : candidate
                        )
                    )
                ),
            .. planned
                .Rules.Select((rule, index) => (rule, index))
                .Where(pair => pair.rule.Strength == RuleStrength.Must)
                .Select(pair =>
                    (
                        HoldOf(
                            pair.rule.ActWishId is null
                                ? RunningOrderHoldKind.MustRule
                                : RunningOrderHoldKind.MustWish
                        ) with
                        {
                            RuleIndex = pair.rule.ActWishId is null
                                ? RuleIndexOf(planned.Rules, pair.index)
                                : null,
                            ActWishId = pair.rule.ActWishId,
                        },
                        planned with
                        {
                            Rules =
                            [
                                .. planned.Rules.Select(
                                    (candidate, index) =>
                                        index == pair.index
                                            ? candidate with
                                            {
                                                Strength = RuleStrength.Prefer,
                                            }
                                            : candidate
                                ),
                            ],
                        }
                    )
                )
                .OrderBy(relaxation => relaxation.Item1.Kind),
        ];
    }

    [Pure]
    private static int RuleIndexOf(IReadOnlyList<ReviewRule> rules, int index) =>
        rules.Take(index).Count(rule => rule.ActWishId is null);

    [Pure]
    private static RunningOrderReviewInput WithLines(
        RunningOrderReviewInput input,
        Func<ReviewLine, ReviewLine> relax
    ) => input with { Lines = [.. input.Lines.Select(relax)] };

    [Pure]
    private static RunningOrderHold HoldOf(RunningOrderHoldKind kind) =>
        new()
        {
            Kind = kind,
            Line = null,
            BlockKey = null,
            RuleIndex = null,
            ActWishId = null,
            ConflictsWithout = 0,
        };
}
