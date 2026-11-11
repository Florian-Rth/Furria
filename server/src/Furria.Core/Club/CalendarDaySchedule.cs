namespace Furria.Core.Club;

public sealed class CalendarDaySchedule : ITimestamped
{
    public int Id { get; set; }

    public int CalendarEntryId { get; set; }

    public int Position { get; set; }

    public string? Title { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public ICollection<CalendarDayScheduleStep> Steps { get; set; } = [];
}
