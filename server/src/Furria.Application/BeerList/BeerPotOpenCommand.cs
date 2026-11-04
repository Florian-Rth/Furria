namespace Furria.Application.BeerList;

public sealed record BeerPotOpenCommand
{
    public required int OwnerPersonId { get; init; }

    public required BeerPotSettings Settings { get; init; }
}
