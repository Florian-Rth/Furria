namespace Furria.Application.Club;

public sealed record CalendarPollDetails
{
    public required int PollId { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required DateTimeOffset? VotesUntil { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required CalendarCloser? ClosedBy { get; init; }

    public required bool IsClosed { get; init; }

    public required int VoterCount { get; init; }

    public int? ConcernedCount { get; init; }

    public IReadOnlyList<CalendarAttendancePerson>? NotAnswered { get; init; }

    public CalendarReminderDetails? Reminder { get; init; }

    public required IReadOnlyList<CalendarPollOptionDetails> Options { get; init; }
}
