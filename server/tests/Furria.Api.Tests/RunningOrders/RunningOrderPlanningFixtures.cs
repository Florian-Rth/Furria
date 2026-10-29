using Furria.Core.RunningOrders;

namespace Furria.Api.Tests.RunningOrders;

internal static class RunningOrderPlanningFixtures
{
    internal const int Anna = 101;
    internal const int Ben = 102;
    internal const int Carl = 103;
    internal const int Dora = 104;

    internal static LineKey Act(int actId) => LineKey.OfAct(actId);

    internal static ReviewLine Nummer(int actId, int? position, params int[] presentPersonIds) =>
        new()
        {
            Key = LineKey.OfAct(actId),
            ActKind = null,
            HasGroup = false,
            Position = position,
            IsPinned = false,
            BlockKey = null,
            Cast = [.. presentPersonIds.Select(personId => new ReviewCastMember(personId, false))],
        };

    internal static ReviewLine Speech(int actId, int? position, params int[] presentPersonIds) =>
        Nummer(actId, position, presentPersonIds) with
        {
            ActKind = ActKind.Speech,
        };

    internal static ReviewLine Dance(int actId, int? position, params int[] presentPersonIds) =>
        Nummer(actId, position, presentPersonIds) with
        {
            ActKind = ActKind.Dance,
        };

    internal static ReviewRule Rule(
        RunningOrderRuleKind kind,
        RuleStrength strength,
        int actId,
        int? otherActId = null
    ) =>
        new()
        {
            Kind = kind,
            Strength = strength,
            ActId = actId,
            OtherActId = otherActId,
            ActKind = null,
            RuleId = actId * 100 + (int)kind,
            ActWishId = null,
        };

    internal static ReviewRule Spread(ActKind actKind, RuleStrength strength) =>
        new()
        {
            Kind = RunningOrderRuleKind.KindSpread,
            Strength = strength,
            ActId = null,
            OtherActId = null,
            ActKind = actKind,
            RuleId = 9000 + (int)actKind,
            ActWishId = null,
        };

    internal static IReadOnlyList<ReviewLine> RuleRichEvening() =>
        [
            Dance(1, 0, Anna, Ben),
            Dance(2, 1, Anna),
            Nummer(3, 2, Ben, Carl),
            Speech(4, 3, Carl),
            Speech(5, 4, Dora) with
            {
                Cast = [new ReviewCastMember(Dora, false), new ReviewCastMember(Anna, true)],
            },
        ];

    internal static IReadOnlyList<ReviewRule> RuleRichRules() =>
        [
            Rule(RunningOrderRuleKind.First, RuleStrength.Must, 2),
            Rule(RunningOrderRuleKind.Last, RuleStrength.Prefer, 1),
            Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Must, 5),
            Rule(RunningOrderRuleKind.SecondHalf, RuleStrength.Prefer, 1),
            Rule(RunningOrderRuleKind.Early, RuleStrength.Prefer, 4),
            Rule(RunningOrderRuleKind.Late, RuleStrength.Must, 2),
            Rule(RunningOrderRuleKind.Before, RuleStrength.Must, 1, 2),
            Rule(RunningOrderRuleKind.After, RuleStrength.Prefer, 3, 5),
            Rule(RunningOrderRuleKind.Apart, RuleStrength.Must, 1, 3),
            Spread(ActKind.Dance, RuleStrength.Prefer),
        ];

    internal static IEnumerable<IReadOnlyList<T>> PermutationsOf<T>(IReadOnlyList<T> items)
    {
        if (items.Count <= 1)
        {
            yield return items;
            yield break;
        }

        for (var index = 0; index < items.Count; index++)
        {
            var rest = items.Where((_, other) => other != index).ToList();
            foreach (var tail in PermutationsOf(rest))
                yield return [items[index], .. tail];
        }
    }
}
