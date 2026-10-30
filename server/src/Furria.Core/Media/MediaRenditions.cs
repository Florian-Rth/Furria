using System.Diagnostics.Contracts;

namespace Furria.Core.Media;

public static class MediaRenditions
{
    private const string WebPContentType = "image/webp";
    private const string Mp4ContentType = "video/mp4";
    private const string M4aContentType = "audio/mp4";
    private const string JsonContentType = "application/json";

    public const int SmallLongEdge = 400;
    public const int MediumLongEdge = 1600;
    public const int LargeLongEdge = 2560;
    public const int VideoLongEdge = 1920;
    public const int VideoShortEdge = 1080;
    public const int CompactLongEdge = 1280;
    public const int CompactShortEdge = 720;

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
        MediaRendition.Compact,
    ];

    private static readonly HashSet<MediaRendition> AudioRenditions =
    [
        MediaRendition.Original,
        MediaRendition.Normalised,
        MediaRendition.Preview,
        MediaRendition.Peaks,
    ];

    [Pure]
    public static bool Exists(MediaKind kind, MediaRendition rendition) =>
        RenditionsOf(kind).Contains(rendition);

    [Pure]
    public static string ContentTypeOf(MediaRendition rendition, string originalContentType) =>
        rendition switch
        {
            MediaRendition.Original => originalContentType,
            MediaRendition.Video or MediaRendition.Compact => Mp4ContentType,
            MediaRendition.Normalised or MediaRendition.Preview => M4aContentType,
            MediaRendition.Peaks => JsonContentType,
            _ => WebPContentType,
        };

    [Pure]
    public static string ExtensionOf(MediaRendition rendition) =>
        rendition switch
        {
            MediaRendition.Video or MediaRendition.Compact => ".mp4",
            MediaRendition.Normalised or MediaRendition.Preview => ".m4a",
            MediaRendition.Peaks => ".json",
            _ => ".webp",
        };

    [Pure]
    private static HashSet<MediaRendition> RenditionsOf(MediaKind kind) =>
        kind switch
        {
            MediaKind.Video => VideoRenditions,
            MediaKind.Audio => AudioRenditions,
            _ => PhotoRenditions,
        };
}
