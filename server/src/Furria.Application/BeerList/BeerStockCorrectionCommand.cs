using Furria.Core.BeerList;

namespace Furria.Application.BeerList;

public sealed record BeerStockCorrectionCommand
{
    public required int BeerPotId { get; init; }

    public required int Crates { get; init; }

    public required BeerStockCorrectionReason Reason { get; init; }

    public required int? BookedByPersonId { get; init; }
}
