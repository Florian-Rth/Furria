using Furria.Core.RunningOrders;
using Furria.Core.Studio;

namespace Furria.Application.RunningOrders;

public sealed record SeasonActSummary
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupReference? Group { get; init; }

    public required int CastCount { get; init; }

    public required IReadOnlyList<ReadinessCheckResult> Readiness { get; init; }

    public required IReadOnlyList<SeasonAppearanceSummary> Appearances { get; init; }
}
