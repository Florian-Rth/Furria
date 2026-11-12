using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record AnnouncementAddOnDetails
{
    public required AnnouncementAddOnKind Kind { get; init; }

    public required AnnouncementAttendanceDetails? Attendance { get; init; }

    public required PollDetails? Poll { get; init; }

    public required SignUpListDetails? SignUpList { get; init; }

    public required BorrowedAddOnDetails? Borrowed { get; init; }
}
