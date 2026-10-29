using Furria.Application.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed record OpeningSlotDto
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly Opens { get; init; }

    public required TimeOnly Closes { get; init; }

    public static OpeningSlotDto From(VenueOpeningSlotDetails slot) =>
        new()
        {
            Weekday = slot.Weekday,
            Opens = slot.Opens,
            Closes = slot.Closes,
        };
}
