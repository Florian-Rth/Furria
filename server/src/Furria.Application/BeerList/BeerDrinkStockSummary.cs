namespace Furria.Application.BeerList;

public sealed record BeerDrinkStockSummary
{
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }

    public required bool IsDefault { get; init; }

    public required bool IsRetired { get; init; }

    public required int Crates { get; init; }

    public required BeerStockProjection Forecast { get; init; }
}
