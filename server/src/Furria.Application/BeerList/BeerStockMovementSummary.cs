using Furria.Core.BeerList;

namespace Furria.Application.BeerList;

public sealed record BeerStockMovementSummary
{
    public required int MovementId { get; init; }

    public required BeerStockMovementKind Kind { get; init; }

    public required int Crates { get; init; }

    public required BeerStockCorrectionReason? Reason { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerListPerson? BookedBy { get; init; }
}
