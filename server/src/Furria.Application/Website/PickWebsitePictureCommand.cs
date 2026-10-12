using Furria.Core.Media;
using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record PickWebsitePictureCommand
{
    public required PictureSlotPosition Slot { get; init; }

    public required int GalleryItemId { get; init; }

    public required PictureCrop Crop { get; init; }

    public required double Aspect { get; init; }

    public required int? PickedByPersonId { get; init; }
}
