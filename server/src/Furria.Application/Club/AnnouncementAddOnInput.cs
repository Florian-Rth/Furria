using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record AnnouncementAddOnInput
{
    public required AnnouncementAddOnKind Kind { get; init; }

    public required AnnouncementAttendanceInput? Attendance { get; init; }

    public required PollInput? Poll { get; init; }

    public required SignUpListInput? SignUpList { get; init; }

    public required BorrowedAddOnInput? Borrowed { get; init; }
}
