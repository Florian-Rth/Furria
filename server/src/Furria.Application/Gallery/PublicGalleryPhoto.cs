using Furria.Application.Media;

namespace Furria.Application.Gallery;

public sealed record PublicGalleryPhoto
{
    public required int MediaItemId { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string? Caption { get; init; }

    public required PictureDetails Picture { get; init; }
}
