namespace Furria.Application.BeerList;

public sealed record BeerDrinkPrice
{
    public required int BeerDrinkId { get; init; }

    public required int CratePriceCents { get; init; }
}
