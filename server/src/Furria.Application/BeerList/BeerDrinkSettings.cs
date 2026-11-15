namespace Furria.Application.BeerList;

public sealed record BeerDrinkSettings
{
    public required string Name { get; init; }

    public required int CratePriceCents { get; init; }
}
