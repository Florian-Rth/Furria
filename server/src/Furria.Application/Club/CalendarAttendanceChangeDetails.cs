using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarAttendanceChangeDetails
{
    public required AttendanceAnswer Answer { get; init; }

    public required bool IsRecordedOnBehalf { get; init; }

    public required string? RecordedByFirstName { get; init; }

    public required string? RecordedByLastName { get; init; }

    public required DateTimeOffset RecordedAt { get; init; }
}
