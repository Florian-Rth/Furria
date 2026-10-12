using Furria.Application.Media;
using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record PublicWebsitePicture
{
    public required PictureSlotPosition Slot { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string? Alt { get; init; }

    public required PictureDetails Picture { get; init; }
}
