using System.Diagnostics.Contracts;

namespace Furria.Core.Gallery;

public static class GalleryBin
{
    public const int RetentionDays = 30;

    private static readonly TimeSpan Retention = TimeSpan.FromDays(RetentionDays);

    [Pure]
    public static DateTimeOffset PurgesAt(DateTimeOffset binnedAt) => binnedAt + Retention;

    [Pure]
    public static DateTimeOffset ExpiredIfBinnedBefore(DateTimeOffset now) => now - Retention;
}
