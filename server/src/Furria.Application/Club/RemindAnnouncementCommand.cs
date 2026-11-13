using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record RemindAnnouncementCommand
{
    public required int ActorAccountId { get; init; }

    public required int AnnouncementId { get; init; }

    public required AnnouncementAddOnKind Kind { get; init; }

    public required int? AddOnId { get; init; }
}
