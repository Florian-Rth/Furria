namespace Furria.Application.Club;

public sealed record CalendarDayScheduleDetails
{
    public required int DayScheduleId { get; init; }

    public required string? Title { get; init; }

    public required IReadOnlyList<CalendarDayScheduleStepDetails> Steps { get; init; }
}
