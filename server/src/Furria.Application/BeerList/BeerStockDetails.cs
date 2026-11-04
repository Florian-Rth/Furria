namespace Furria.Application.BeerList;

public sealed record BeerStockDetails
{
    public required int Crates { get; init; }

    public required BeerStockProjection Forecast { get; init; }

    public required IReadOnlyList<BeerStockMovementSummary> Movements { get; init; }
}
