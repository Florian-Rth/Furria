namespace Furria.Application.Gallery;

public sealed record GalleryInboxQuery
{
    public required int ActorAccountId { get; init; }

    public required int? UploaderPersonId { get; init; }

    public required bool Ownerless { get; init; }
}
