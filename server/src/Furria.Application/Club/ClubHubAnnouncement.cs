namespace Furria.Application.Club;

public sealed record ClubHubAnnouncement
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required ClubHubPerson Author { get; init; }
}
