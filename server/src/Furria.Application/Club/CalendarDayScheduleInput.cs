namespace Furria.Application.Club;

public sealed record CalendarDayScheduleInput
{
    public required int? DayScheduleId { get; init; }

    public required string? Title { get; init; }

    public required IReadOnlyList<CalendarDayScheduleStepInput> Steps { get; init; }
}
