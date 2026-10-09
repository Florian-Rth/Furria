namespace Furria.Application.Gallery;

public sealed record GalleryActor
{
    public required int? PersonId { get; init; }

    public required bool MayUpload { get; init; }

    public required bool MayManage { get; init; }
}
