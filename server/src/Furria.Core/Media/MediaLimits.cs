using System.Diagnostics.Contracts;

namespace Furria.Core.Media;

public static class MediaLimits
{
    public const long MaxPhotoBytes = 100L * 1024 * 1024;
    public const long MaxVideoBytes = 20L * 1024 * 1024 * 1024;

    [Pure]
    public static long MaxBytesOf(MediaKind kind) =>
        kind == MediaKind.Video ? MaxVideoBytes : MaxPhotoBytes;
}
