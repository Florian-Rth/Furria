namespace Furria.Application.Gallery;

public sealed record DeleteGalleryItemsCommand
{
    public required GalleryActor Actor { get; init; }

    public required IReadOnlyCollection<int> MediaItemIds { get; init; }
}
