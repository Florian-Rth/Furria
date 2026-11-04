namespace Furria.Application.BeerList;

public sealed record BeerPotHandoverCommand
{
    public required int BeerPotId { get; init; }

    public required int SuccessorPersonId { get; init; }

    public required BeerPotSettings SuccessorSettings { get; init; }

    public required int? HandedOverByPersonId { get; init; }
}
