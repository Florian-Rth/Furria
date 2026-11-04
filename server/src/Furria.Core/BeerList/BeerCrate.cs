using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerCrate
{
    public const int MaxPerOwnBooking = 3;
    public const int MaxPerOperatorBooking = 20;

    public static readonly TimeSpan UndoWindow = TimeSpan.FromSeconds(10);

    public int Id { get; set; }

    public int BeerPotId { get; set; }

    public int? PersonId { get; set; }

    public int PriceCents { get; set; }

    public int? EnteredByPersonId { get; set; }

    public DateTimeOffset BookedAt { get; set; }

    public DateTimeOffset? UndoneAt { get; set; }

    public int? UndoneByPersonId { get; set; }

    public int? PaidByPaymentId { get; set; }

    public BeerPot? Pot { get; set; }

    public Person? Person { get; set; }

    public Person? EnteredBy { get; set; }

    public Person? UndoneBy { get; set; }
}
