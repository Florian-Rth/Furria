namespace Furria.Application.Gallery;

public sealed record BinnedAlbumSummary
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required int ItemCount { get; init; }

    public required GalleryMediaRef? Cover { get; init; }

    public required DateTimeOffset BinnedAt { get; init; }

    public required DateTimeOffset PurgesAt { get; init; }
}
