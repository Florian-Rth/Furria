using Furria.Core.BeerList;

namespace Furria.Application.BeerList;

public sealed record BeerStockMovementSummary
{
    public required int MovementId { get; init; }

    public required BeerStockMovementKind Kind { get; init; }

    public required int BeerDrinkId { get; init; }

    public required string DrinkName { get; init; }

    public required int Crates { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerListPerson? BookedBy { get; init; }
}
