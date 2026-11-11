namespace Furria.Core.Club;

public sealed class CalendarDayScheduleStep : ITimestamped
{
    public int Id { get; set; }

    public int DayScheduleId { get; set; }

    public int Day { get; set; }

    public TimeOnly Time { get; set; }

    public string Text { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarDaySchedule? DaySchedule { get; set; }
}
