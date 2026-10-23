using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record RunningOrderRuleDetails
{
    public required int RuleId { get; init; }

    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    public required int? ActId { get; init; }

    public required int? OtherActId { get; init; }

    public required ActKind? ActKind { get; init; }
}
