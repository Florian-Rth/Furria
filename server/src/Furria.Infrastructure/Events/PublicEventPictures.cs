using System.Diagnostics.Contracts;
using Furria.Application.Events;
using Furria.Core.Media;
using Furria.Infrastructure.Public;

namespace Furria.Infrastructure.Events;

public static class PublicEventPictures
{
    [Pure]
    public static PublicEventPicture? Of(
        int? mediaItemId,
        DateTimeOffset? renderedAt,
        int? width,
        int? height,
        MediaCrop? crop
    )
    {
        var picture = PublicPictures.Of(PublicPictureKind.EventPicture, mediaItemId, renderedAt);
        if (picture is null || width is not { } imageWidth || height is not { } imageHeight)
            return null;

        var cut = CutOf(crop, imageWidth, imageHeight);
        return new PublicEventPicture
        {
            Width = PixelsOf(cut.Width, imageWidth),
            Height = PixelsOf(cut.Height, imageHeight),
            Picture = picture,
        };
    }

    [Pure]
    private static PictureCrop CutOf(MediaCrop? crop, int width, int height) =>
        crop is null
            ? PictureCrop.Centred(width, height, MediaOwner.EventPictureAspect)
            : new PictureCrop(crop.Left, crop.Top, crop.Width, crop.Height).FittedTo(
                width,
                height,
                MediaOwner.EventPictureAspect
            );

    [Pure]
    private static int PixelsOf(double fraction, int length) =>
        (int)Math.Round(fraction * length, MidpointRounding.AwayFromZero);
}
