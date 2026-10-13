using Furria.Core.Media;

namespace Furria.Application.Events;

public sealed record PickEventPictureCommand
{
    public required int EventId { get; init; }

    public required int GalleryItemId { get; init; }

    public required PictureCrop Crop { get; init; }
}
