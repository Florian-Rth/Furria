using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarAttendanceAnswerDetails
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required AttendanceAnswer Answer { get; init; }

    public required string? RecordedByFirstName { get; init; }

    public required string? RecordedByLastName { get; init; }

    public required DateTimeOffset AnsweredAt { get; init; }
}
