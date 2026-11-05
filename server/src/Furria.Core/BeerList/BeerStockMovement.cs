using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerStockMovement
{
    public const int MaxCrates = 500;

    public int Id { get; set; }

    public int BeerPotId { get; set; }

    public BeerStockMovementKind Kind { get; set; }

    public int Crates { get; set; }

    public int? BookedByPersonId { get; set; }

    public DateTimeOffset BookedAt { get; set; }

    public BeerPot? Pot { get; set; }

    public Person? BookedBy { get; set; }
}
