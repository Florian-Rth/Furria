using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class RuleStep : ICostStep
{
    private readonly RuleStrength _strength;

    public RunningOrderCostStep Step { get; }

    public int Weight { get; }

    private RuleStep(RuleStrength strength, RunningOrderCostStep step, int weight)
    {
        _strength = strength;
        Step = step;
        Weight = weight;
    }

    public static RuleStep Must() =>
        new(RuleStrength.Must, RunningOrderCostStep.MustRules, CostWeights.Conflict);

    public static RuleStep Prefer() =>
        new(RuleStrength.Prefer, RunningOrderCostStep.PreferRules, CostWeights.Hint);

    public int BaseViolations(PlanFacts facts) => 0;

    public int ViolationsAddedByLastLine(PartialOrder partial, PlanFacts facts) =>
        BrokenSpreadsOf(partial, facts) + BrokenSubjectRulesOf(partial, facts);

    public int ViolationsOf(CompleteOrder order) =>
        _strength == RuleStrength.Must
            ? order.FindingsOfKind(FindingKind.MustRuleBroken)
            : order.FindingsOfKind(FindingKind.PreferRuleMissed);

    [Pure]
    private int BrokenSpreadsOf(PartialOrder partial, PlanFacts facts)
    {
        if (partial.Count < 2)
            return 0;

        var (previous, last) = (partial.FromEnd(2), partial.Last);
        if (previous.ActKind is null || previous.ActKind != last.ActKind)
            return 0;

        var broken = 0;
        foreach (var rule in facts.SpreadRules)
        {
            if (rule.Strength == _strength && rule.ActKind == last.ActKind)
                broken++;
        }

        return broken;
    }

    [Pure]
    private int BrokenSubjectRulesOf(PartialOrder partial, PlanFacts facts)
    {
        var broken = 0;
        foreach (var rule in facts.RulesTriggeredBy(partial.Last.Key))
        {
            if (rule.Strength == _strength && RuleVerdicts.IsBrokenByLastLine(rule, partial, facts))
                broken++;
        }

        return broken;
    }
}
