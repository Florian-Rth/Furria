namespace Furria.Application.Club;

public sealed record CalendarDayScheduleStepInput
{
    public required int? StepId { get; init; }

    public required int Day { get; init; }

    public required TimeOnly Time { get; init; }

    public required string Text { get; init; }
}
