namespace Furria.Application.Club;

public sealed record AnnouncementAttendanceDetails
{
    public required DateTimeOffset? AnswersUntil { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required CalendarCloser? ClosedBy { get; init; }

    public required bool IsClosed { get; init; }

    public required int Yes { get; init; }

    public required int Maybe { get; init; }

    public required int No { get; init; }

    public required int ConcernedCount { get; init; }

    public required IReadOnlyList<CalendarAttendanceAnswerDetails> Answers { get; init; }

    public required IReadOnlyList<CalendarAttendancePerson>? NotAnswered { get; init; }

    public required CalendarReminderDetails? Reminder { get; init; }
}
