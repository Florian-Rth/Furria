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

    public RenderedMedia Render(RenditionFiles files, MediaCropDetails? crop)
    {
        try
        {
            using var original = Image.NewFromFile(files.OriginalPath, failOn: Enums.FailOn.Error);
            var facts = ExifFacts.Of(FieldReader(original));
            using var upright = original.Autorot();
            using var framed = Framed(upright, crop);
            using var display = WebPWriter.InSrgb(framed);
            foreach (var (rendition, longEdge) in Sizes)
                WebPWriter.Save(display, longEdge, files, rendition);

            return new RenderedMedia
            {
                Width = upright.Width,
                Height = upright.Height,
                CapturedAt = facts.CapturedAt,
                Camera = facts.Camera,
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

    private static Image Framed(Image upright, MediaCropDetails? crop)
    {
        if (crop is null)
            return upright.Copy();

        var region = CropRegion.Of(crop, upright.Width, upright.Height);
        return upright.ExtractArea(region.Left, region.Top, region.Width, region.Height);
    }

    private static Func<string, string?> FieldReader(Image image) =>
        field => image.Contains(field) ? image.Get(field) as string : null;
}
