using Furria.Application.Media;
using Furria.Core.Media;

namespace Furria.Application.Club;

public sealed record SessionLogoEditingDetails
{
    public required MediaItemState State { get; init; }

    public required bool IsStalled { get; init; }

    public required SessionLogoDetails? Logo { get; init; }

    public required string? UncroppedUrl { get; init; }

    public required MediaCropDetails? Crop { get; init; }
}
