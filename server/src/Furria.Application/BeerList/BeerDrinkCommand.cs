namespace Furria.Application.BeerList;

public sealed record BeerDrinkCommand
{
    public required int BeerPotId { get; init; }

    public required BeerDrinkSettings Settings { get; init; }
}
