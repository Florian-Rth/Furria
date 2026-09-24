namespace Furria.Application.Groups;

public sealed record GroupTrainingSlotInput
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly StartsAt { get; init; }

    public required int DurationMinutes { get; init; }

    public required int? VenueId { get; init; }
}
