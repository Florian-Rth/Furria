using Furria.Core.Club;

namespace Furria.Application.Start;

public sealed record StartAnnouncementAttendance
{
    public required int Position { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsOwed { get; init; }
}
