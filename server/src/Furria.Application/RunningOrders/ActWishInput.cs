using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record ActWishInput
{
    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }
}
