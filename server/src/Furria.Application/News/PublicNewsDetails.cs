using Furria.Application.Media;
using Furria.Core.News;

namespace Furria.Application.News;

public sealed record PublicNewsDetails
{
    public required string Slug { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory Category { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required NewsAuthor? Author { get; init; }

    public required PictureDetails? Picture { get; init; }

    public required string? PictureCaption { get; init; }

    public required IReadOnlyList<MentionableGroup> MentionedGroups { get; init; }

    public required IReadOnlyList<MentionablePerson> MentionedPersons { get; init; }

    public required NewsEventTie? Event { get; init; }

    public required PublicNewsAlbum? Album { get; init; }
}
