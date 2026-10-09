using Furria.Core.Media;

namespace Furria.Application.Media;

public sealed record PictureEditingDetails
{
    public required MediaItemState State { get; init; }

    public required PictureDetails? Picture { get; init; }

    public required string? UncroppedUrl { get; init; }

    public required MediaCropDetails? Crop { get; init; }
}
