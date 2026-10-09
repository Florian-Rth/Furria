using Furria.Application.Gallery;

namespace Furria.Application.Start;

public sealed record StartAlbumSummary
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required int ItemCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required GalleryMediaRef? Cover { get; init; }
}
