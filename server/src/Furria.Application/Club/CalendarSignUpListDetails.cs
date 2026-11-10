namespace Furria.Application.Club;

public sealed record CalendarSignUpListDetails
{
    public required int SignUpListId { get; init; }

    public required string Title { get; init; }

    public required string? Hint { get; init; }

    public required DateTimeOffset? SignUpUntil { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required CalendarCloser? ClosedBy { get; init; }

    public required bool IsClosed { get; init; }

    public int? ConcernedCount { get; init; }

    public IReadOnlyList<CalendarAttendancePerson>? NotAnswered { get; init; }

    public required IReadOnlyList<CalendarSignUpLineDetails> Lines { get; init; }
}
