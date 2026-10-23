using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record ActWishDetails
{
    public required int ActWishId { get; init; }

    public required int ActId { get; init; }

    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }
}
