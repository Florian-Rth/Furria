namespace Furria.Core.RunningOrders;

public sealed record RunningOrderRuleDraft
{
    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    public required int? ActId { get; init; }

    public required int? OtherActId { get; init; }

    public required ActKind? ActKind { get; init; }
}
