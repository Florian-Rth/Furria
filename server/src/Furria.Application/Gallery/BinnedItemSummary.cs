namespace Furria.Application.Gallery;

public sealed record BinnedItemSummary
{
    public required GalleryMediaRef Item { get; init; }

    public required string OriginalFileName { get; init; }

    public required int AlbumId { get; init; }

    public required string AlbumTitle { get; init; }

    public required DateTimeOffset BinnedAt { get; init; }

    public required DateTimeOffset PurgesAt { get; init; }
}
