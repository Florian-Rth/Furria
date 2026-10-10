using Furria.Core.Media;

namespace Furria.Application.News;

public sealed record PickNewsPictureCommand
{
    public required int NewsPostId { get; init; }

    public required int GalleryItemId { get; init; }

    public required PictureCrop Crop { get; init; }

    public required int? PickedByPersonId { get; init; }
}
