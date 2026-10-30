using Furria.Core.Club;

namespace Furria.Application.Studio;

public sealed record MarkAttendanceCommand
{
    public required ActTrainingPersonCommand Target { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}
