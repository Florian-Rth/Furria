using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record PlaceWebsitePictureCommand
{
    public required PictureSlotPosition Slot { get; init; }

    public required int MediaItemId { get; init; }

    public required double Aspect { get; init; }

    public string? Alt { get; init; }

    public required int? PlacedByPersonId { get; init; }
}
