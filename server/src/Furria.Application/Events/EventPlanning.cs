using Furria.Core.Events;
using Furria.Core.Halls;

namespace Furria.Application.Events;

public sealed record EventPlanning
{
    public required IReadOnlyList<MissingEventDetail> DetailsMissing { get; init; }

    public required EventReadiness Readiness { get; init; }

    public required TablePlanCount? TablePlan { get; init; }

    public required bool WithoutTablePlan { get; init; }
}
