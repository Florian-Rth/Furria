using Furria.Core.Club;

namespace Furria.Application.Start;

public sealed record StartAttendance
{
    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsOwed { get; init; }
}
