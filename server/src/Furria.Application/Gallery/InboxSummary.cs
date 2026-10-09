namespace Furria.Application.Gallery;

public sealed record InboxSummary
{
    public required GalleryUploader? Uploader { get; init; }

    public required int Photos { get; init; }

    public required int Videos { get; init; }

    public required DateTimeOffset LatestUploadedAt { get; init; }
}
