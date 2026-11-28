using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarMarkablePerson
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required AttendanceAnswer? Answer { get; init; }

    public required IReadOnlyList<CalendarAttendanceChangeDetails> Trail { get; init; }
}
