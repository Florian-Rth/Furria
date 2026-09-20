namespace Furria.Application.Club;

public sealed record WithdrawAnnouncementCommand
{
    public required int AnnouncementId { get; init; }

    public required int ActorPersonId { get; init; }

    public required bool ActorMayPostAnnouncements { get; init; }
}
