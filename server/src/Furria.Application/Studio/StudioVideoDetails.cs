using Furria.Core.Media;
using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record StudioVideoDetails
{
    public required int VideoId { get; init; }

    public required int MediaItemId { get; init; }

    public required string? Name { get; init; }

    public required MediaItemState State { get; init; }

    public required double? DurationSeconds { get; init; }

    public required double? StartSeconds { get; init; }

    public required VideoPlacement Placement { get; init; }

    public required bool IsOutdated { get; init; }

    public required StudioVideoUrls Urls { get; init; }
}
