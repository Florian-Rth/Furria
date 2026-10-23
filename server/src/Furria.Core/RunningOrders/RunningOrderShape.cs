using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public static class RunningOrderShape
{
    [Pure]
    public static RunningOrderShapeProblem? ProblemOf(
        IReadOnlyList<RunningOrderLineDraft> lines,
        IReadOnlyList<RunningOrderRuleDraft> rules
    ) =>
        HasDuplicateAct(lines) ? RunningOrderShapeProblem.DuplicateAct
        : !ArePositionsDense(lines) ? RunningOrderShapeProblem.PositionsNotDense
        : lines.Any(line => line.IsPinned && line.Position is null)
            ? RunningOrderShapeProblem.PinnedLineUnplaced
        : lines.Any(line => line.BlockKey is not null && line.Position is null)
            ? RunningOrderShapeProblem.BlockMemberUnplaced
        : !AreBlocksContiguous(lines) ? RunningOrderShapeProblem.BlockNotContiguous
        : rules.Any(rule => !IsWellFormed(rule)) ? RunningOrderShapeProblem.RuleShapeInvalid
        : !AreRuleSubjectsPresent(lines, rules) ? RunningOrderShapeProblem.RuleSubjectMissing
        : null;

    [Pure]
    private static bool HasDuplicateAct(IReadOnlyList<RunningOrderLineDraft> lines) =>
        lines.GroupBy(line => line.ActId).Any(group => group.Count() > 1);

    [Pure]
    private static bool ArePositionsDense(IReadOnlyList<RunningOrderLineDraft> lines)
    {
        var positions = lines
            .Where(line => line.Position is not null)
            .Select(line => line.Position!.Value)
            .Order()
            .ToList();

        return positions.SequenceEqual(Enumerable.Range(0, positions.Count));
    }

    [Pure]
    private static bool AreBlocksContiguous(IReadOnlyList<RunningOrderLineDraft> lines) =>
        lines
            .Where(line => line.BlockKey is not null)
            .GroupBy(line => line.BlockKey)
            .All(block =>
                block.Max(line => line.Position)!.Value - block.Min(line => line.Position)!.Value
                == block.Count() - 1
            );

    [Pure]
    private static bool IsWellFormed(RunningOrderRuleDraft rule) =>
        rule.Kind switch
        {
            RunningOrderRuleKind.KindSpread => rule.ActKind is not null
                && rule.ActId is null
                && rule.OtherActId is null,
            _ when RunningOrderRuleKinds.IsAboutTwoActs(rule.Kind) => rule.ActId is not null
                && rule.OtherActId is not null
                && rule.ActId != rule.OtherActId
                && rule.ActKind is null,
            _ => rule.ActId is not null && rule.OtherActId is null && rule.ActKind is null,
        };

    [Pure]
    private static bool AreRuleSubjectsPresent(
        IReadOnlyList<RunningOrderLineDraft> lines,
        IReadOnlyList<RunningOrderRuleDraft> rules
    )
    {
        var actIds = lines.Select(line => line.ActId).ToHashSet();

        return rules.All(rule =>
            (rule.ActId is null || actIds.Contains(rule.ActId.Value))
            && (rule.OtherActId is null || actIds.Contains(rule.OtherActId.Value))
        );
    }
}
