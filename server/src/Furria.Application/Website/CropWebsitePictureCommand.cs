using Furria.Core.Media;
using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record CropWebsitePictureCommand
{
    public required PictureSlotPosition Slot { get; init; }

    public required PictureCrop Crop { get; init; }

    public required double Aspect { get; init; }

    public required int? CroppedByPersonId { get; init; }
}
