namespace Furria.Application.Start;

public sealed record StartAnnouncementSummary
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required StartPerson Author { get; init; }
}
