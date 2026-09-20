using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class KeyHolding : ITimestamped
{
    public int Id { get; set; }

    public int VenueId { get; set; }

    public int PersonId { get; set; }

    public DateOnly SinceOn { get; set; }

    public DateOnly? UntilOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Venue? Venue { get; set; }

    public Person? Person { get; set; }
}
