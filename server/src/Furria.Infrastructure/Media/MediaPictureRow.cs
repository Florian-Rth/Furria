using Furria.Core.Media;

namespace Furria.Infrastructure.Media;

public sealed record MediaPictureRow(
    int MediaItemId,
    MediaItemState State,
    DateTimeOffset? RenderedAt,
    MediaCrop? Crop
);
