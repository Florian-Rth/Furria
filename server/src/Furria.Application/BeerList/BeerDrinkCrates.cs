namespace Furria.Application.BeerList;

public sealed record BeerDrinkCrates
{
    public required int BeerDrinkId { get; init; }

    public required int Crates { get; init; }
}
