using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record DescribeWebsitePictureCommand
{
    public required PictureSlotPosition Slot { get; init; }

    public required string? Alt { get; init; }

    public required int? DescribedByPersonId { get; init; }
}
