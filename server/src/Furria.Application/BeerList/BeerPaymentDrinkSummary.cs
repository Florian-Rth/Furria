namespace Furria.Application.BeerList;

public sealed record BeerPaymentDrinkSummary
{
    public required int BeerDrinkId { get; init; }

    public required string Name { get; init; }

    public required int Crates { get; init; }
}
