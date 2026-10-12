using Furria.Application.Media;
using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record WebsitePictureDetails
{
    public required PictureSlotPosition Slot { get; init; }

    public required int MediaItemId { get; init; }

    public required double Aspect { get; init; }

    public required string? Alt { get; init; }

    public required PictureEditingDetails Picture { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required WebsitePictureEditor? UpdatedBy { get; init; }
}
