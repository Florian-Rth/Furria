using Furria.Application.Media;

namespace Furria.Application.Club;

public sealed record SessionLogoDetails
{
    public required PictureDetails Picture { get; init; }

    public required double Aspect { get; init; }
}
