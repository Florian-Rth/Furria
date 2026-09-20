using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record SetAttendanceResponseCommand
{
    public required int CalendarEntryId { get; init; }

    public required int PersonId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}
