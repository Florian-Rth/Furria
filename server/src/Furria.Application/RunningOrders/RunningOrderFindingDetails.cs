using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record RunningOrderFindingDetails
{
    public required FindingKind Kind { get; init; }

    public required FindingSeverity Severity { get; init; }

    public required IReadOnlyList<int> LineIds { get; init; }

    public required IReadOnlyList<int> PersonIds { get; init; }

    public required int? RuleId { get; init; }

    public required int? ActWishId { get; init; }
}
