using System.Diagnostics.Contracts;
using Furria.Application.Media;

namespace Furria.Api.Media;

public sealed record PictureDto
{
    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }

    [Pure]
    public static PictureDto? From(PictureDetails? picture) =>
        picture is null
            ? null
            : new PictureDto
            {
                SmallUrl = picture.SmallUrl,
                MediumUrl = picture.MediumUrl,
                LargeUrl = picture.LargeUrl,
            };
}
