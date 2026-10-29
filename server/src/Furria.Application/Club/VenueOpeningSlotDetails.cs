namespace Furria.Application.Club;

public sealed record VenueOpeningSlotDetails
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly Opens { get; init; }

    public required TimeOnly Closes { get; init; }
}
