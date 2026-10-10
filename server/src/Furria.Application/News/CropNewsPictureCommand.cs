using Furria.Core.Media;

namespace Furria.Application.News;

public sealed record CropNewsPictureCommand
{
    public required int NewsPostId { get; init; }

    public required PictureCrop Crop { get; init; }

    public required int? CroppedByPersonId { get; init; }
}
