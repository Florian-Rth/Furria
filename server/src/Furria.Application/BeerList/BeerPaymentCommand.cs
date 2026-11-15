namespace Furria.Application.BeerList;

public sealed record BeerPaymentCommand
{
    public required int BeerPotId { get; init; }

    public required int PersonId { get; init; }

    public required IReadOnlyList<BeerDrinkCrates> Drinks { get; init; }

    public required int? BookedByPersonId { get; init; }
}
