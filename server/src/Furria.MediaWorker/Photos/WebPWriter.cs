using Furria.Core.Media;
using Furria.MediaWorker.Renditions;
using NetVips;

namespace Furria.MediaWorker.Photos;

public static class WebPWriter
{
    private const int Quality = 82;
    private const string EmbeddedProfileField = "icc-profile-data";
    private const string SrgbProfile = "srgb";

    public static Image InSrgb(Image image)
    {
        using var profiled = image.Contains(EmbeddedProfileField)
            ? image.IccTransform(SrgbProfile, embedded: true, intent: Enums.Intent.Perceptual)
            : image.Copy();
        return profiled.Colourspace(Enums.Interpretation.Srgb);
    }

    public static void Save(
        Image image,
        int longEdge,
        RenditionFiles files,
        MediaRendition rendition
    )
    {
        var scratch = files.ScratchFileFor(rendition, ".webp");
        using (var resized = image.ThumbnailImage(longEdge, longEdge, Enums.Size.Down))
            resized.Webpsave(
                scratch,
                q: Quality,
                smartSubsample: true,
                keep: Enums.ForeignKeep.None
            );
        files.Publish(scratch, rendition);
    }
}
