namespace Furria.Application.Gallery;

public sealed record GalleryBinDetails
{
    public required IReadOnlyList<BinnedAlbumSummary> Albums { get; init; }

    public required IReadOnlyList<BinnedItemSummary> Items { get; init; }
}
