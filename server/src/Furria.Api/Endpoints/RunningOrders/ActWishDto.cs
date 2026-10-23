using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed record ActWishDto
{
    public required int ActWishId { get; init; }

    public required int ActId { get; init; }

    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    [Pure]
    public static ActWishDto From(ActWishDetails wish) =>
        new()
        {
            ActWishId = wish.ActWishId,
            ActId = wish.ActId,
            Kind = wish.Kind,
            Strength = wish.Strength,
        };
}
