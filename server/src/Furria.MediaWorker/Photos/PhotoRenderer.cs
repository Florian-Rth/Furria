using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.MediaWorker.Renditions;
using NetVips;

namespace Furria.MediaWorker.Photos;

public sealed class PhotoRenderer
{
    private static readonly IReadOnlyList<(MediaRendition Rendition, int LongEdge)> Sizes =
    [
        (MediaRendition.Small, MediaRenditions.SmallLongEdge),
        (MediaRendition.Medium, MediaRenditions.MediumLongEdge),
        (MediaRendition.Large, MediaRenditions.LargeLongEdge),
    ];

    public RenderedMedia Render(RenditionFiles files, MediaCropDetails? crop, double? pictureAspect)
    {
        try
        {
            using var original = Image.NewFromFile(files.OriginalPath, failOn: Enums.FailOn.Error);
            var facts = ExifFacts.Of(FieldReader(original));
            using var upright = original.Autorot();
            using var display = WebPWriter.InSrgb(upright);
            var cut = CutOf(crop, pictureAspect, upright.Width, upright.Height);
            using var framed = Framed(display, cut);
            foreach (var (rendition, longEdge) in Sizes)
                WebPWriter.Save(framed, longEdge, files, rendition);
            if (cut is not null)
                WebPWriter.Save(
                    display,
                    MediaRenditions.MediumLongEdge,
                    files,
                    MediaRendition.Uncropped
                );

            return new RenderedMedia
            {
                Width = upright.Width,
                Height = upright.Height,
                CapturedAt = facts.CapturedAt,
                Camera = facts.Camera,
                AppliedCrop = cut is { } applied
                    ? new MediaCropDetails(applied.Left, applied.Top, applied.Width, applied.Height)
                    : null,
            };
        }
        catch (VipsException exception)
        {
            throw new MediaRenderingException(
                $"The photo could not be read: {exception.Message.Trim()}",
                exception
            );
        }
    }

    private static Image Framed(Image display, PictureCrop? cut)
    {
        if (cut is not { } crop)
            return display.Copy();

        var region = CropRegion.Of(crop, display.Width, display.Height);
        return display.ExtractArea(region.Left, region.Top, region.Width, region.Height);
    }

    [Pure]
    private static PictureCrop? CutOf(
        MediaCropDetails? crop,
        double? pictureAspect,
        int width,
        int height
    )
    {
        var chosen = crop is null
            ? (PictureCrop?)null
            : new PictureCrop(crop.Left, crop.Top, crop.Width, crop.Height);

        return (chosen, pictureAspect) switch
        {
            ({ } cut, { } aspect) => cut.FittedTo(width, height, aspect),
            (null, { } aspect) => PictureCrop.Centred(width, height, aspect),
            _ => chosen,
        };
    }

    private static Func<string, string?> FieldReader(Image image) =>
        field => image.Contains(field) ? image.Get(field) as string : null;
}
