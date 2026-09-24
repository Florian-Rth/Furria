namespace Furria.Application.Groups;

public sealed record GroupTrainingSlotDetails
{
    public required int GroupTrainingSlotId { get; init; }

    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly StartsAt { get; init; }

    public required int DurationMinutes { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }
}
