using Furria.Application.Media;
using Furria.Core.News;

namespace Furria.Application.News;

public sealed record NewsPostVersion
{
    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory? Category { get; init; }

    public required NewsEventTie? Event { get; init; }

    public required NewsAlbumTie? Album { get; init; }

    public required PictureEditingDetails? Picture { get; init; }

    public required string? PictureCaption { get; init; }
}
