namespace Furria.Application.BeerList;

public sealed record BeerPotOpenCommand
{
    public required int OwnerPersonId { get; init; }

    public required string? PaymentLink { get; init; }

    public required IReadOnlyList<BeerDrinkSettings> Drinks { get; init; }
}
