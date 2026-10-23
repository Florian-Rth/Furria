using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal sealed class PlanFacts
{
    private static readonly IReadOnlyList<ReviewRule> NoRules = [];

    private readonly IReadOnlyDictionary<LineKey, IReadOnlyList<ReviewRule>> _rulesByTrigger;
    private readonly IReadOnlyDictionary<LineKey, PlanLine> _linesByKey;

    public IReadOnlyList<PlanLine> Lines { get; }

    public int PersonCount { get; }

    public IReadOnlyList<ReviewRule> SubjectRules { get; }

    public IReadOnlyList<ReviewRule> SpreadRules { get; }

    public bool AreSpeechesSpreadByRule { get; }

    public PlanFacts(RunningOrderReviewInput input)
    {
        var placed = input
            .Lines.Where(line => line.Position is not null)
            .OrderBy(line => line.Position)
            .ToList();
        var slotsByPersonId = input
            .Lines.SelectMany(line => line.Cast)
            .Select(member => member.PersonId)
            .Distinct()
            .Order()
            .Select((personId, slot) => (personId, slot))
            .ToDictionary(pair => pair.personId, pair => pair.slot);
        PersonCount = slotsByPersonId.Count;
        Lines =
        [
            .. placed.Select((line, index) => new PlanLine(line, index, slotsByPersonId)),
            .. input
                .Lines.Where(line => line.Position is null)
                .Select((line, index) => new PlanLine(line, placed.Count + index, slotsByPersonId)),
        ];
        _linesByKey = Lines.ToDictionary(line => line.Key);
        SubjectRules =
        [
            .. input.Rules.Where(rule =>
                rule.Kind != RunningOrderRuleKind.KindSpread && rule.ActId is not null
            ),
        ];
        SpreadRules =
        [
            .. input.Rules.Where(rule =>
                rule.Kind == RunningOrderRuleKind.KindSpread && rule.ActKind is not null
            ),
        ];
        AreSpeechesSpreadByRule = SpreadRules.Any(rule => rule.ActKind == ActKind.Speech);
        _rulesByTrigger = SubjectRules
            .SelectMany(rule => TriggersOf(rule).Select(trigger => (trigger, rule)))
            .GroupBy(pair => pair.trigger)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<ReviewRule>)[.. group.Select(pair => pair.rule)]
            );
    }

    [Pure]
    public IReadOnlyList<ReviewRule> RulesTriggeredBy(LineKey key) =>
        _rulesByTrigger.TryGetValue(key, out var rules) ? rules : NoRules;

    [Pure]
    public PlanLine LineOf(LineKey key) => _linesByKey[key];

    [Pure]
    public PlanLine? FindLine(LineKey key) => _linesByKey.GetValueOrDefault(key);

    [Pure]
    private static IEnumerable<LineKey> TriggersOf(ReviewRule rule)
    {
        yield return LineKey.OfAct(rule.ActId!.Value);
        if (rule.OtherActId is { } otherActId)
            yield return LineKey.OfAct(otherActId);
    }
}
