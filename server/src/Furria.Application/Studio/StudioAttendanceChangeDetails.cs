using Furria.Core.Club;

namespace Furria.Application.Studio;

public sealed record StudioAttendanceChangeDetails
{
    public required AttendanceAnswer Answer { get; init; }

    public required bool IsRecordedOnBehalf { get; init; }

    public required string? RecordedBy { get; init; }

    public required DateTimeOffset RecordedAt { get; init; }
}
