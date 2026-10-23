using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public static class RunningOrderReview
{
    [Pure]
    public static IReadOnlyList<RunningOrderFinding> FindingsOf(RunningOrderReviewInput input)
    {
        var evening = Evening.Of(input.Lines);
        IEnumerable<RunningOrderFinding> findings =
        [
            .. ChangeoverFindingsOf(evening),
            .. RuleFindingsOf(evening, input.Rules),
            .. SameKindFindingsOf(evening, input.Rules),
            .. CastFindingsOf(input.Lines),
            .. UnplacedFindingsOf(input.Lines),
        ];

        return InReadingOrder(findings, evening);
    }

    [Pure]
    private static IEnumerable<RunningOrderFinding> ChangeoverFindingsOf(Evening evening)
    {
        var sequence = evening.Sequence;
        for (var index = 0; index + 1 < sequence.Count; index++)
        {
            var shared = SharedPresentPersons(sequence[index], sequence[index + 1]);
            if (shared.Count > 0)
                yield return CastFinding(
                    FindingKind.NoChangeover,
                    FindingSeverity.Conflict,
                    [sequence[index].Key, sequence[index + 1].Key],
                    shared
                );
        }

        for (var index = 0; index + 2 < sequence.Count; index++)
        {
            var between = sequence[index + 1];
            var tight = SharedPresentPersons(sequence[index], sequence[index + 2])
                .Except(PresentPersonsOf(between))
                .ToList();
            if (tight.Count > 0)
                yield return CastFinding(
                    FindingKind.TightChangeover,
                    FindingSeverity.Hint,
                    [sequence[index].Key, sequence[index + 2].Key],
                    tight
                );
        }
    }

    [Pure]
    private static IEnumerable<RunningOrderFinding> RuleFindingsOf(
        Evening evening,
        IReadOnlyList<ReviewRule> rules
    ) =>
        rules.SelectMany(rule =>
            rule.Kind == RunningOrderRuleKind.KindSpread
                ? KindSpreadFindingsOf(evening, rule)
                : SubjectRuleFindingsOf(evening, rule)
        );

    [Pure]
    private static IEnumerable<RunningOrderFinding> SubjectRuleFindingsOf(
        Evening evening,
        ReviewRule rule
    )
    {
        if (rule.ActId is not { } actId || !evening.Places(actId))
            return [];
        if (RunningOrderRuleKinds.IsAboutTwoActs(rule.Kind) && !IsOtherPlaced(evening, rule))
            return [];

        IReadOnlyList<LineKey> lines = RunningOrderRuleKinds.IsAboutTwoActs(rule.Kind)
            ? [LineKey.OfAct(actId), LineKey.OfAct(rule.OtherActId!.Value)]
            : [LineKey.OfAct(actId)];

        return IsMet(evening, rule, actId) ? [] : [BrokenRuleFinding(lines, rule)];
    }

    [Pure]
    private static bool IsOtherPlaced(Evening evening, ReviewRule rule) =>
        rule.OtherActId is { } otherActId && evening.Places(otherActId);

    [Pure]
    private static bool IsMet(Evening evening, ReviewRule rule, int actId)
    {
        var index = evening.IndexOf(actId);
        var count = evening.Sequence.Count;

        return rule.Kind switch
        {
            RunningOrderRuleKind.First => index == 0,
            RunningOrderRuleKind.Last => index == count - 1,
            RunningOrderRuleKind.FirstHalf => EveningSections.IsInFirstHalf(index, count),
            RunningOrderRuleKind.SecondHalf => !EveningSections.IsInFirstHalf(index, count),
            RunningOrderRuleKind.Early => EveningSections.IsEarly(index, count),
            RunningOrderRuleKind.Late => EveningSections.IsLate(index, count),
            RunningOrderRuleKind.Before => index < evening.IndexOf(rule.OtherActId!.Value),
            RunningOrderRuleKind.After => index > evening.IndexOf(rule.OtherActId!.Value),
            RunningOrderRuleKind.Apart => Math.Abs(index - evening.IndexOf(rule.OtherActId!.Value))
                >= 2,
            _ => true,
        };
    }

    [Pure]
    private static IEnumerable<RunningOrderFinding> KindSpreadFindingsOf(
        Evening evening,
        ReviewRule rule
    ) =>
        rule.ActKind is { } actKind
            ? AdjacentPairsOfKind(evening, actKind)
                .Select(pair => BrokenRuleFinding([pair.First.Key, pair.Second.Key], rule))
            : [];

    [Pure]
    private static IEnumerable<RunningOrderFinding> SameKindFindingsOf(
        Evening evening,
        IReadOnlyList<ReviewRule> rules
    ) =>
        rules.Any(rule =>
            rule.Kind == RunningOrderRuleKind.KindSpread && rule.ActKind == ActKind.Speech
        )
            ? []
            : AdjacentPairsOfKind(evening, ActKind.Speech)
                .Select(pair => new RunningOrderFinding
                {
                    Kind = FindingKind.SameKindAdjacent,
                    Severity = FindingSeverity.Hint,
                    Lines = [pair.First.Key, pair.Second.Key],
                    PersonIds = [],
                    RuleId = null,
                    ActWishId = null,
                });

    [Pure]
    private static IEnumerable<(ReviewLine First, ReviewLine Second)> AdjacentPairsOfKind(
        Evening evening,
        ActKind actKind
    ) =>
        evening
            .Sequence.Zip(evening.Sequence.Skip(1))
            .Where(pair => pair.First.ActKind == actKind && pair.Second.ActKind == actKind);

    [Pure]
    private static IEnumerable<RunningOrderFinding> CastFindingsOf(IReadOnlyList<ReviewLine> lines)
    {
        foreach (var line in lines)
        {
            var absent = line
                .Cast.Where(member => member.IsAbsent)
                .Select(member => member.PersonId)
                .Order()
                .ToList();
            if (absent.Count == 0)
                continue;

            yield return line.HasGroup && absent.Count == line.Cast.Count
                ? CastFinding(FindingKind.NobodyThere, FindingSeverity.Conflict, [line.Key], absent)
                : CastFinding(FindingKind.Absences, FindingSeverity.Hint, [line.Key], absent);
        }
    }

    [Pure]
    private static IEnumerable<RunningOrderFinding> UnplacedFindingsOf(
        IReadOnlyList<ReviewLine> lines
    ) =>
        lines
            .Where(line => line.Position is null)
            .Select(line =>
                CastFinding(FindingKind.Unplaced, FindingSeverity.Hint, [line.Key], [])
            );

    [Pure]
    private static IReadOnlyList<RunningOrderFinding> InReadingOrder(
        IEnumerable<RunningOrderFinding> findings,
        Evening evening
    ) =>
        [
            .. findings
                .Select(finding =>
                    (Finding: finding, Ranks: finding.Lines.Select(evening.RankOf).ToList())
                )
                .OrderBy(ranked => ranked.Ranks.Min())
                .ThenBy(ranked => ranked.Finding.Kind)
                .ThenBy(ranked => ranked.Ranks, RankListComparer.Instance)
                .ThenBy(ranked => ranked.Finding.RuleId ?? 0)
                .ThenBy(ranked => ranked.Finding.ActWishId ?? 0)
                .Select(ranked => ranked.Finding),
        ];

    [Pure]
    private static IReadOnlyList<int> SharedPresentPersons(ReviewLine first, ReviewLine second) =>
        [.. PresentPersonsOf(first).Intersect(PresentPersonsOf(second)).Order()];

    [Pure]
    private static IEnumerable<int> PresentPersonsOf(ReviewLine line) =>
        line.Cast.Where(member => !member.IsAbsent).Select(member => member.PersonId);

    [Pure]
    private static RunningOrderFinding BrokenRuleFinding(
        IReadOnlyList<LineKey> lines,
        ReviewRule rule
    ) =>
        RuleFinding(
            rule.Strength == RuleStrength.Must
                ? FindingKind.MustRuleBroken
                : FindingKind.PreferRuleMissed,
            lines,
            rule
        );

    [Pure]
    private static RunningOrderFinding RuleFinding(
        FindingKind kind,
        IReadOnlyList<LineKey> lines,
        ReviewRule rule
    ) =>
        new()
        {
            Kind = kind,
            Severity =
                kind == FindingKind.MustRuleBroken
                    ? FindingSeverity.Conflict
                    : FindingSeverity.Hint,
            Lines = lines,
            PersonIds = [],
            RuleId = rule.RuleId,
            ActWishId = rule.ActWishId,
        };

    [Pure]
    private static RunningOrderFinding CastFinding(
        FindingKind kind,
        FindingSeverity severity,
        IReadOnlyList<LineKey> lines,
        IReadOnlyList<int> personIds
    ) =>
        new()
        {
            Kind = kind,
            Severity = severity,
            Lines = lines,
            PersonIds = personIds,
            RuleId = null,
            ActWishId = null,
        };

    private sealed class RankListComparer : IComparer<List<int>>
    {
        public static readonly RankListComparer Instance = new();

        public int Compare(List<int>? x, List<int>? y)
        {
            var first = x ?? [];
            var second = y ?? [];
            for (var index = 0; index < Math.Min(first.Count, second.Count); index++)
            {
                var order = first[index].CompareTo(second[index]);
                if (order != 0)
                    return order;
            }

            return first.Count.CompareTo(second.Count);
        }
    }
}
