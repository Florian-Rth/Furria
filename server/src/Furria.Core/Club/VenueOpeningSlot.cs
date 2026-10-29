namespace Furria.Core.Club;

public sealed class VenueOpeningSlot : ITimestamped
{
    public int Id { get; set; }

    public int VenueId { get; set; }

    public DayOfWeek Weekday { get; set; }

    public TimeOnly Opens { get; set; }

    public TimeOnly Closes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Venue? Venue { get; set; }
}
