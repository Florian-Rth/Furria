namespace Furria.Application.BeerList;

public sealed record BeerOwnCratesCommand
{
    public required int PersonId { get; init; }

    public required int BeerDrinkId { get; init; }

    public required int Count { get; init; }
}
