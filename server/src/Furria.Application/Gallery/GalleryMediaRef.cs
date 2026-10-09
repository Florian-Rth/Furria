using Furria.Core.Media;

namespace Furria.Application.Gallery;

public sealed record GalleryMediaRef
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }
}
