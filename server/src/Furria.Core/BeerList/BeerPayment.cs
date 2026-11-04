using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerPayment
{
    public const int MaxCrates = 500;

    public int Id { get; set; }

    public int BeerPotId { get; set; }

    public int? PersonId { get; set; }

    public int Crates { get; set; }

    public int AmountCents { get; set; }

    public int? BookedByPersonId { get; set; }

    public DateTimeOffset BookedAt { get; set; }

    public DateTimeOffset? UndoneAt { get; set; }

    public int? UndoneByPersonId { get; set; }

    public BeerPot? Pot { get; set; }

    public Person? Person { get; set; }

    public Person? BookedBy { get; set; }

    public Person? UndoneBy { get; set; }
}
