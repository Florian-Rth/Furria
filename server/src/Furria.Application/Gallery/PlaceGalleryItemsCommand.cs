namespace Furria.Application.Gallery;

public sealed record PlaceGalleryItemsCommand
{
    public required int ActorAccountId { get; init; }

    public required int AlbumId { get; init; }

    public required IReadOnlyCollection<int> MediaItemIds { get; init; }
}
