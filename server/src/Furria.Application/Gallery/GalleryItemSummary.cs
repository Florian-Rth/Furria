using Furria.Core.Media;

namespace Furria.Application.Gallery;

public sealed record GalleryItemSummary
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required double? DurationSeconds { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required DateTimeOffset UploadedAt { get; init; }

    public required string? Camera { get; init; }

    public required string OriginalFileName { get; init; }

    public required GalleryUploader? Uploader { get; init; }

    public required int? SelectionPosition { get; init; }

    public required string? Caption { get; init; }
}
