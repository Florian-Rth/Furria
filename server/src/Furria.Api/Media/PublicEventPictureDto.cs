using System.Diagnostics.Contracts;
using Furria.Application.Events;

namespace Furria.Api.Media;

public sealed record PublicEventPictureDto
{
    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }

    [Pure]
    public static PublicEventPictureDto? From(PublicEventPicture? picture) =>
        picture is null
            ? null
            : new PublicEventPictureDto
            {
                Width = picture.Width,
                Height = picture.Height,
                SmallUrl = picture.Picture.SmallUrl,
                MediumUrl = picture.Picture.MediumUrl,
                LargeUrl = picture.Picture.LargeUrl,
            };
}
