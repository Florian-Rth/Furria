namespace Furria.Application.BeerList;

public sealed record BeerPaymentCommand
{
    public required int BeerPotId { get; init; }

    public required int PersonId { get; init; }

    public required int Crates { get; init; }

    public required int? BookedByPersonId { get; init; }
}
