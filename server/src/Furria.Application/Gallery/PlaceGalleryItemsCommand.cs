namespace Furria.Application.Gallery;

public sealed record PlaceGalleryItemsCommand
{
    public required GalleryActor Actor { get; init; }

    public required int AlbumId { get; init; }

    public required IReadOnlyCollection<int> MediaItemIds { get; init; }
}
