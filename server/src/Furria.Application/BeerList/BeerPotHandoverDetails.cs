namespace Furria.Application.BeerList;

public sealed record BeerPotHandoverDetails
{
    public required int SuccessorBeerPotId { get; init; }

    public required int CarriedCrates { get; init; }
}
