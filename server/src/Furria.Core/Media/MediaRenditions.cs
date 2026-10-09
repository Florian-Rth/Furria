using System.Diagnostics.Contracts;

namespace Furria.Core.Media;

public static class MediaRenditions
{
    private const string WebPContentType = "image/webp";
    private const string Mp4ContentType = "video/mp4";

    public const int SmallLongEdge = 400;
    public const int MediumLongEdge = 1600;
    public const int LargeLongEdge = 2560;
    public const int VideoLongEdge = 1920;
    public const int VideoShortEdge = 1080;

    private static readonly HashSet<MediaRendition> PhotoRenditions =
    [
        MediaRendition.Original,
        MediaRendition.Small,
        MediaRendition.Medium,
        MediaRendition.Large,
        MediaRendition.Uncropped,
    ];

    private static readonly HashSet<MediaRendition> VideoRenditions =
    [
        MediaRendition.Original,
        MediaRendition.Small,
        MediaRendition.Poster,
        MediaRendition.Video,
    ];

    [Pure]
    public static bool Exists(MediaKind kind, MediaRendition rendition) =>
        (kind == MediaKind.Video ? VideoRenditions : PhotoRenditions).Contains(rendition);

    [Pure]
    public static string ContentTypeOf(MediaRendition rendition, string originalContentType) =>
        rendition switch
        {
            MediaRendition.Original => originalContentType,
            MediaRendition.Video => Mp4ContentType,
            _ => WebPContentType,
        };

    [Pure]
    public static string ExtensionOf(MediaRendition rendition) =>
        rendition == MediaRendition.Video ? ".mp4" : ".webp";
}
