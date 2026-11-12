namespace Furria.Application.Club;

public sealed record CreateAnnouncementCommand
{
    public required int AuthorPersonId { get; init; }

    public required int AuthorAccountId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required IReadOnlyList<AnnouncementAddOnInput> AddOns { get; init; }
}
