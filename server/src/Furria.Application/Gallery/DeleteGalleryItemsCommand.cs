namespace Furria.Application.Gallery;

public sealed record DeleteGalleryItemsCommand
{
    public required int ActorAccountId { get; init; }

    public required IReadOnlyCollection<int> MediaItemIds { get; init; }
}
