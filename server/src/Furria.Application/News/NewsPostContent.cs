using Furria.Core.News;

namespace Furria.Application.News;

public sealed record NewsPostContent
{
    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory? Category { get; init; }

    public required int? EventId { get; init; }

    public required int? AlbumId { get; init; }

    public required string? PictureCaption { get; init; }
}
