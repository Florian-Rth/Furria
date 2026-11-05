namespace Furria.Application.BeerList;

public sealed record BeerGiverSummary
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required int Crates { get; init; }
}
