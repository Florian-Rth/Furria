using Furria.Core.Media;

namespace Furria.Application.Club;

public sealed record SessionLogoEditingDetails
{
    public required MediaItemState State { get; init; }

    public required bool IsStalled { get; init; }

    public required SessionLogoDetails? Logo { get; init; }
}
