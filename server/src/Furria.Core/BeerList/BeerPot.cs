using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerPot : ITimestamped
{
    public const int PaymentLinkLength = 200;
    public const int PaymentNoteLength = 500;
    public const int MaxCratePriceCents = 100_00;

    public int Id { get; set; }

    public int OwnerPersonId { get; set; }

    public int CratePriceCents { get; set; }

    public string? PaymentLink { get; set; }

    public string? PaymentNote { get; set; }

    public DateTimeOffset OpenedAt { get; set; }

    public DateTimeOffset? ClosedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Owner { get; set; }
}
