namespace Furria.Application.BeerList;

public sealed record BeerCratesForCommand
{
    public required int BeerPotId { get; init; }

    public required int PersonId { get; init; }

    public required int Count { get; init; }

    public required int? EnteredByPersonId { get; init; }
}
