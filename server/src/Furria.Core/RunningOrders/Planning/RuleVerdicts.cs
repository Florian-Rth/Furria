using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class RuleVerdicts
{
    [Pure]
    public static bool IsBrokenByLastLine(ReviewRule rule, PartialOrder partial, PlanFacts facts)
    {
        var last = partial.Last.Key;
        var decidedNow =
            IsDecidable(rule, partial, notCounting: null)
            && !IsDecidable(rule, partial, notCounting: last);

        return decidedNow && !IsMet(rule, partial, facts);
    }

    [Pure]
    public static bool IsCertainToBreak(ReviewRule rule, PartialOrder partial, PlanFacts facts) =>
        !IsDecidable(rule, partial, notCounting: null) && IsDoomed(rule, partial, facts);

    [Pure]
    private static bool IsDoomed(ReviewRule rule, PartialOrder partial, PlanFacts facts)
    {
        var placed = partial.Count;
        var count = facts.Lines.Count;

        return rule.Kind switch
        {
            RunningOrderRuleKind.First => placed > 0,
            RunningOrderRuleKind.Early => placed >= EveningSections.ThirdLength(count),
            RunningOrderRuleKind.FirstHalf => placed >= EveningSections.FirstHalfLength(count),
            _ => false,
        };
    }

    [Pure]
    private static bool IsDecidable(ReviewRule rule, PartialOrder partial, LineKey? notCounting)
    {
        bool places(LineKey key) => key != notCounting && partial.Places(key);

        var subject = places(LineKey.OfAct(rule.ActId!.Value));
        var other = rule.OtherActId is { } otherActId && places(LineKey.OfAct(otherActId));

        return rule.Kind switch
        {
            RunningOrderRuleKind.Before or RunningOrderRuleKind.After => subject || other,
            RunningOrderRuleKind.Apart => subject && other,
            _ => subject,
        };
    }

    [Pure]
    private static bool IsMet(ReviewRule rule, PartialOrder partial, PlanFacts facts)
    {
        var subject = LineKey.OfAct(rule.ActId!.Value);
        var count = facts.Lines.Count;

        return rule.Kind switch
        {
            RunningOrderRuleKind.First => partial.IndexOf(subject) == 0,
            RunningOrderRuleKind.Last => partial.IndexOf(subject) == count - 1,
            RunningOrderRuleKind.FirstHalf => EveningSections.IsInFirstHalf(
                partial.IndexOf(subject),
                count
            ),
            RunningOrderRuleKind.SecondHalf => !EveningSections.IsInFirstHalf(
                partial.IndexOf(subject),
                count
            ),
            RunningOrderRuleKind.Early => EveningSections.IsEarly(partial.IndexOf(subject), count),
            RunningOrderRuleKind.Late => EveningSections.IsLate(partial.IndexOf(subject), count),
            RunningOrderRuleKind.Before => partial.Places(subject),
            RunningOrderRuleKind.After => !partial.Places(subject),
            RunningOrderRuleKind.Apart => Math.Abs(
                partial.IndexOf(subject) - partial.IndexOf(LineKey.OfAct(rule.OtherActId!.Value))
            ) >= 2,
            _ => true,
        };
    }
}
