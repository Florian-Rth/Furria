using Furria.Core.Events;

namespace Furria.Application.Events;

public sealed record EventPlanning
{
    public required IReadOnlyList<MissingEventDetail> DetailsMissing { get; init; }

    public required EventReviewTally Review { get; init; }

    public required EventReadiness Readiness { get; init; }
}
