using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record SetAnnouncementResponseCommand
{
    public required int AnnouncementId { get; init; }

    public required int ActorAccountId { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}
