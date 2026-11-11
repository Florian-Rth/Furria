namespace Furria.Application.Club;

public sealed record CalendarAttendanceDetails
{
    public required bool IsClosed { get; init; }

    public required int Yes { get; init; }

    public required int Maybe { get; init; }

    public required int No { get; init; }

    public required IReadOnlyList<CalendarAttendanceAnswerDetails>? Answers { get; init; }

    public required IReadOnlyList<CalendarAttendancePerson>? NotAnswered { get; init; }

    public CalendarReminderDetails? Reminder { get; init; }
}
