namespace Furria.Application.BeerList;

public sealed record BeerPotDrinkSummary
{
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }

    public required bool HasStock { get; init; }

    public required bool IsDefault { get; init; }
}
