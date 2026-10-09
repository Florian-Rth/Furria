namespace Furria.Application.Media;

public sealed record PictureDetails
{
    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }
}
