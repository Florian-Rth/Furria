using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed record ActWishDataDto
{
    public required RunningOrderRuleKind Kind { get; init; }

    public required RuleStrength Strength { get; init; }

    [Pure]
    public ActWishInput ToInput() => new() { Kind = Kind, Strength = Strength };
}
