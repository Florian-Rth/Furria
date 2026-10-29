namespace Furria.Api.Endpoints.Venues;

public sealed record OpeningSlotDataDto
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly Opens { get; init; }

    public required TimeOnly Closes { get; init; }
}
