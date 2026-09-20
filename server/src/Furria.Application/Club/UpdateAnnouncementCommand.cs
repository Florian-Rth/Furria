namespace Furria.Application.Club;

public sealed record UpdateAnnouncementCommand
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required int ActorPersonId { get; init; }

    public required bool ActorMayPostAnnouncements { get; init; }
}
