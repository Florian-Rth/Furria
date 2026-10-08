using System.Diagnostics.Contracts;

namespace Furria.Core.Media;

public static class MediaPaths
{
    public const string StagingDirectory = "staging";

    private const string OriginalsDirectory = "originals";
    private const string RenditionsDirectory = "renditions";
    private const int ShardLength = 2;

    [Pure]
    public static string OriginalOf(Guid storageKey) =>
        Path.Combine(OriginalsDirectory, ShardOf(storageKey), KeyOf(storageKey));

    [Pure]
    public static string RenditionsOf(Guid storageKey) =>
        Path.Combine(RenditionsDirectory, ShardOf(storageKey), KeyOf(storageKey));

    [Pure]
    public static string RenditionOf(Guid storageKey, MediaRendition rendition) =>
        rendition == MediaRendition.Original
            ? OriginalOf(storageKey)
            : Path.Combine(
                RenditionsOf(storageKey),
                $"{rendition.ToString().ToLowerInvariant()}{MediaRenditions.ExtensionOf(rendition)}"
            );

    [Pure]
    private static string ShardOf(Guid storageKey) => KeyOf(storageKey)[..ShardLength];

    [Pure]
    private static string KeyOf(Guid storageKey) => storageKey.ToString("N");
}
