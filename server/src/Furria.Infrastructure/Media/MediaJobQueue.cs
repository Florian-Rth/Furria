using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Media;

public sealed class MediaJobQueue
{
    private static readonly string AbandonedReason =
        $"Rendering stopped without an answer {MediaRetrySchedule.MaxAttempts} times";

    public static readonly TimeSpan LeaseDuration = TimeSpan.FromMinutes(5);

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MediaJobQueue> _logger;

    public MediaJobQueue(
        AppDbContext dbContext,
        TimeProvider timeProvider,
        ILogger<MediaJobQueue> logger
    )
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<MediaJobLease?> ClaimAsync(MediaKind kind, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var now = _timeProvider.GetUtcNow();
        await FailAbandonedJobsAsync(kind, now, ct);
        var job = await ClaimableJobAsync(kind, now, ct);
        if (job is not null)
            Lease(job, now);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return job is null ? null : new MediaJobLease(job.Id, job.LeaseId!.Value);
    }

    public async Task<MediaJobDetails?> DetailsOfAsync(MediaJobLease lease, CancellationToken ct)
    {
        var job = await HeldJobs(lease)
            .AsNoTracking()
            .Include(row => row.MediaItem!)
                .ThenInclude(item => item.WebsitePicture)
            .SingleOrDefaultAsync(ct);

        return job?.MediaItem is { } item ? DetailsOf(job, item) : null;
    }

    public async Task<bool> RenewLeaseAsync(MediaJobLease lease, CancellationToken ct)
    {
        var leaseExpiresAt = _timeProvider.GetUtcNow() + LeaseDuration;
        var renewed = await HeldJobs(lease)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(job => job.LeaseExpiresAt, leaseExpiresAt),
                ct
            );
        return renewed == 1;
    }

    public async Task<bool> CompleteAsync(CompleteMediaJobCommand command, CancellationToken ct)
    {
        var job = await HeldJobs(command.Lease)
            .Include(row => row.MediaItem)
            .SingleOrDefaultAsync(ct);
        if (job?.MediaItem is not { } item)
            return await _dbContext.MediaItems.AnyAsync(row => row.Id == command.MediaItemId, ct);

        _dbContext.MediaJobs.Remove(job);
        item.Width = command.Width;
        item.Height = command.Height;
        item.DurationSeconds = command.DurationSeconds;
        item.CapturedAt = command.CapturedAt;
        item.Camera = Truncated(command.Camera, MediaItem.CameraLength);
        item.FailureReason = null;
        item.RenderedAt = _timeProvider.GetUtcNow();
        if (item.Crop is null && command.AppliedCrop is { } appliedCrop)
            item.Crop = MediaCrops.ToEntity(appliedCrop);
        item.State = await HasFurtherJobsAsync(job, ct)
            ? MediaItemState.Processing
            : MediaItemState.Ready;
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task FailAsync(MediaJobLease lease, string reason, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var job = await HeldJobs(lease).SingleOrDefaultAsync(ct);
        if (job is null)
            return;

        if (MediaRetrySchedule.DelayAfterFailed(job.Attempts) is { } delay)
        {
            _logger.LogWarning(
                "Media item {MediaItemId} failed on attempt {AttemptNumber}, retrying in {RetryDelay}: {FailureReason}",
                job.MediaItemId,
                job.Attempts,
                delay,
                reason
            );
            Release(job, _timeProvider.GetUtcNow() + delay);
        }
        else
        {
            _logger.LogError(
                "Media item {MediaItemId} failed after {AttemptCount} attempts: {FailureReason}",
                job.MediaItemId,
                job.Attempts,
                reason
            );
            _dbContext.MediaJobs.Remove(job);
            await MarkFailedAsync(
                _dbContext.MediaItems.Where(item => item.Id == job.MediaItemId),
                reason,
                ct
            );
        }

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    public async Task GiveUpAsync(MediaJobLease lease, string reason, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var job = await HeldJobs(lease).SingleOrDefaultAsync(ct);
        if (job is null)
            return;

        _logger.LogWarning(
            "Media item {MediaItemId} cannot be rendered, giving up: {FailureReason}",
            job.MediaItemId,
            reason
        );
        _dbContext.MediaJobs.Remove(job);
        await MarkFailedAsync(
            _dbContext.MediaItems.Where(item => item.Id == job.MediaItemId),
            reason,
            ct
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    public async Task ReleaseAsync(MediaJobLease lease, CancellationToken ct)
    {
        var job = await HeldJobs(lease).SingleOrDefaultAsync(ct);
        if (job is null)
            return;

        job.Attempts--;
        Release(job, job.AvailableAt);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<int> RegenerateAsync(RegenerateMediaCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var items = await ItemsIn(command)
            .Where(item =>
                !_dbContext.MediaJobs.Any(job =>
                    job.MediaItemId == item.Id && job.ClaimedAt == null
                )
            )
            .ToListAsync(ct);

        foreach (var item in items)
        {
            item.State = MediaItemState.Processing;
            item.FailureReason = null;
            _dbContext.MediaJobs.Add(
                new MediaJob
                {
                    MediaItemId = item.Id,
                    EnqueuedAt = now,
                    AvailableAt = now,
                }
            );
        }

        await _dbContext.SaveChangesAsync(ct);
        return items.Count;
    }

    private Task<MediaJob?> ClaimableJobAsync(
        MediaKind kind,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        _dbContext
            .MediaJobs.FromSql(
                $"""
                SELECT job.* FROM media_job AS job
                JOIN media_item AS item ON item.id = job.media_item_id
                WHERE item.kind = {kind.ToString()}
                  AND job.available_at <= {now}
                  AND (
                    job.claimed_at IS NULL
                    OR (job.lease_expires_at < {now} AND job.attempts < {MediaRetrySchedule.MaxAttempts})
                  )
                  AND NOT EXISTS (
                    SELECT 1 FROM media_job AS other
                    WHERE other.media_item_id = job.media_item_id
                      AND other.id <> job.id
                      AND other.claimed_at IS NOT NULL
                      AND other.lease_expires_at >= {now}
                  )
                ORDER BY job.available_at, job.id
                LIMIT 1
                FOR UPDATE OF job SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private async Task FailAbandonedJobsAsync(
        MediaKind kind,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var abandoned = _dbContext.MediaJobs.Where(job =>
            job.MediaItem!.Kind == kind
            && job.ClaimedAt != null
            && job.LeaseExpiresAt < now
            && job.Attempts >= MediaRetrySchedule.MaxAttempts
        );
        var failed = await MarkFailedAsync(
            _dbContext.MediaItems.Where(item => abandoned.Any(job => job.MediaItemId == item.Id)),
            AbandonedReason,
            ct
        );
        if (failed == 0)
            return;

        await abandoned.ExecuteDeleteAsync(ct);
        _logger.LogError(
            "{MediaItemCount} {MediaKind} media items failed, their rendering stopped without an answer {AttemptCount} times",
            failed,
            kind,
            MediaRetrySchedule.MaxAttempts
        );
    }

    private IQueryable<MediaJob> HeldJobs(MediaJobLease lease) =>
        _dbContext.MediaJobs.Where(job => job.Id == lease.JobId && job.LeaseId == lease.LeaseId);

    private Task<bool> HasFurtherJobsAsync(MediaJob job, CancellationToken ct) =>
        _dbContext.MediaJobs.AnyAsync(
            other => other.MediaItemId == job.MediaItemId && other.Id != job.Id,
            ct
        );

    private IQueryable<MediaItem> ItemsIn(RegenerateMediaCommand command) =>
        command.Scope switch
        {
            MediaRegenerationScope.All => _dbContext.MediaItems,
            MediaRegenerationScope.Failed => _dbContext.MediaItems.Where(item =>
                item.State == MediaItemState.Failed
            ),
            _ => _dbContext.MediaItems.Where(item => command.MediaItemIds.Contains(item.Id)),
        };

    private static Task<int> MarkFailedAsync(
        IQueryable<MediaItem> items,
        string reason,
        CancellationToken ct
    )
    {
        var failureReason = Truncated(reason, MediaItem.FailureReasonLength);
        return items.ExecuteUpdateAsync(
            setters =>
                setters
                    .SetProperty(item => item.State, MediaItemState.Failed)
                    .SetProperty(item => item.FailureReason, failureReason),
            ct
        );
    }

    private static void Lease(MediaJob job, DateTimeOffset now)
    {
        job.ClaimedAt = now;
        job.LeaseId = Guid.NewGuid();
        job.LeaseExpiresAt = now + LeaseDuration;
        job.Attempts++;
    }

    private static void Release(MediaJob job, DateTimeOffset availableAt)
    {
        job.AvailableAt = availableAt;
        job.ClaimedAt = null;
        job.LeaseId = null;
        job.LeaseExpiresAt = null;
    }

    [Pure]
    private static MediaJobDetails DetailsOf(MediaJob job, MediaItem item) =>
        new()
        {
            Lease = new MediaJobLease(job.Id, job.LeaseId!.Value),
            MediaItemId = item.Id,
            StorageKey = item.StorageKey,
            Kind = item.Kind,
            Crop = item.Crop is { } crop ? MediaCrops.ToDetails(crop) : null,
            PictureAspect = item.WebsitePicture?.Aspect ?? MediaOwner.Of(item).PictureAspect,
            Attempt = job.Attempts,
        };

    [Pure]
    private static string? Truncated(string? text, int maxLength) =>
        text is null || text.Length <= maxLength ? text : text[..maxLength];
}
