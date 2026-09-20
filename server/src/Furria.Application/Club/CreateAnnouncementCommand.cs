namespace Furria.Application.Club;

public sealed record CreateAnnouncementCommand
{
    public required int AuthorPersonId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }
}
