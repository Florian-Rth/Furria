using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public static class MediaStalls
{
    public static readonly TimeSpan StallAfter = TimeSpan.FromMinutes(2);

    [Pure]
    public static Expression<Func<MediaItem, bool>> IsStalled(
        AppDbContext dbContext,
        DateTimeOffset now
    )
    {
        var waitingSince = now - StallAfter;
        return item =>
            item.State == MediaItemState.Processing
            && !dbContext.MediaJobs.Any(job =>
                job.MediaItemId == item.Id && job.AvailableAt > waitingSince
            )
            && !dbContext.MediaJobs.Any(job =>
                job.MediaItem!.Kind == item.Kind && job.LeaseExpiresAt >= now
            );
    }

    public static async Task<IReadOnlySet<int>> StalledAmongAsync(
        this AppDbContext dbContext,
        IEnumerable<MediaPictureRow?> pictures,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var processingIds = pictures
            .OfType<MediaPictureRow>()
            .Where(picture => picture.State == MediaItemState.Processing)
            .Select(picture => picture.MediaItemId)
            .ToList();
        if (processingIds.Count == 0)
            return new HashSet<int>();

        var stalledIds = await dbContext
            .MediaItems.Where(item => processingIds.Contains(item.Id))
            .Where(IsStalled(dbContext, now))
            .Select(item => item.Id)
            .ToListAsync(ct);
        return stalledIds.ToHashSet();
    }
}
