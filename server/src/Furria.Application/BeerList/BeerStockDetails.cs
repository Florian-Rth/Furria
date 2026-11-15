namespace Furria.Application.BeerList;

public sealed record BeerStockDetails
{
    public required IReadOnlyList<BeerDrinkStockSummary> Drinks { get; init; }

    public required IReadOnlyList<BeerStockMovementSummary> Movements { get; init; }
}
