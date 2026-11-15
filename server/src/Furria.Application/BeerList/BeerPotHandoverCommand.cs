namespace Furria.Application.BeerList;

public sealed record BeerPotHandoverCommand
{
    public required int BeerPotId { get; init; }

    public required int SuccessorPersonId { get; init; }

    public required string? SuccessorPaymentLink { get; init; }

    public required IReadOnlyList<BeerDrinkPrice> CarriedDrinkPrices { get; init; }

    public required int? HandedOverByPersonId { get; init; }
}
