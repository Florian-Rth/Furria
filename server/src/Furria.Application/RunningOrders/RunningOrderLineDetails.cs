using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record RunningOrderLineDetails
{
    public required int LineId { get; init; }

    public required RunningOrderActDetails Act { get; init; }

    public required int? Position { get; init; }

    public required bool IsPinned { get; init; }

    public required int? BlockKey { get; init; }

    public required IReadOnlyList<EveningChange> EveningChanges { get; init; }
}
