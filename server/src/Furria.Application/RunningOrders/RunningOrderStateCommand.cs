using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record RunningOrderStateCommand
{
    public required IReadOnlyList<RunningOrderLineDraft> Lines { get; init; }

    public required IReadOnlyList<RunningOrderRuleDraft> Rules { get; init; }

    public required IReadOnlyList<int> SuspendedActWishIds { get; init; }
}
