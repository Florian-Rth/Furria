using Furria.Core.Club;

namespace Furria.Application.Studio;

public sealed record StudioAttendanceDetails
{
    public required int PersonId { get; init; }

    public required AttendanceAnswer Answer { get; init; }

    public required bool IsRecordedOnBehalf { get; init; }

    public required string? RecordedBy { get; init; }

    public required IReadOnlyList<StudioAttendanceChangeDetails> Trail { get; init; }
}
