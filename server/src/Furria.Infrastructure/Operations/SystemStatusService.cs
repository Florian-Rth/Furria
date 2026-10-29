using Furria.Application.Operations;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace Furria.Infrastructure.Operations;

public sealed class SystemStatusService
{
    private const int ShownFailedMedia = 5;

    private static readonly TimeSpan RecentFailureWindow = TimeSpan.FromHours(24);
    private static readonly IReadOnlyList<int> NoErrors = new int[SystemFacts.ErrorHours];

    private readonly AppDbContext _dbContext;
    private readonly DatabaseProbe _databaseProbe;
    private readonly BackgroundRuns _runs;
    private readonly HostStart _hostStart;
    private readonly MediaStorageSnapshot _storageSnapshot;
    private readonly MediaRoot _mediaRoot;
    private readonly IHostEnvironment _environment;
    private readonly TimeProvider _timeProvider;

    public SystemStatusService(
        AppDbContext dbContext,
        DatabaseProbe databaseProbe,
        BackgroundRuns runs,
        HostStart hostStart,
        MediaStorageSnapshot storageSnapshot,
        MediaRoot mediaRoot,
        IHostEnvironment environment,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _databaseProbe = databaseProbe;
        _runs = runs;
        _hostStart = hostStart;
        _storageSnapshot = storageSnapshot;
        _mediaRoot = mediaRoot;
        _environment = environment;
        _timeProvider = timeProvider;
    }

    public async Task<SystemStatusDetails> StatusAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var database = await _databaseProbe.FactsAsync(ct);
        var facts = database.IsReachable
            ? await FactsWithDatabaseAsync(now, database, ct)
            : FactsWithoutDatabase(now, database);

        return new SystemStatusDetails { Facts = facts, Verdict = SystemVerdict.Of(facts) };
    }

    private async Task<SystemFacts> FactsWithDatabaseAsync(
        DateTimeOffset now,
        SystemDatabaseDetails database,
        CancellationToken ct
    ) =>
        FactsWithoutDatabase(now, database) with
        {
            Media = await MediaAsync(now, ct),
            Queue = await QueueAsync(now, ct),
            Workers = await WorkersAsync(now, ct),
            Mail = await MailAsync(ct),
            ErrorsPerHour = await _databaseProbe.ErrorsPerHourAsync(now, ct),
            LogsSince = await _dbContext
                .LogEntries.Select(entry => (DateTimeOffset?)entry.LoggedAt)
                .MinAsync(ct),
        };

    private SystemFacts FactsWithoutDatabase(DateTimeOffset now, SystemDatabaseDetails database) =>
        new()
        {
            CheckedAt = now,
            App = new SystemAppDetails
            {
                Version = FurriaVersion.Current,
                Environment = _environment.EnvironmentName,
                StartedAt = _hostStart.StartedAt,
            },
            Database = database,
            Storage = new SystemStorageDetails
            {
                Volume = MediaVolume.Of(_mediaRoot),
                Survey = _storageSnapshot.Latest,
            },
            Media = SystemMediaDetails.Unknown,
            Queue = MediaQueueDetails.Unknown,
            Workers = [],
            Services = _runs.Snapshot(),
            Mail = MailOutboxDetails.Unknown,
            ErrorsPerHour = NoErrors,
            LogsSince = null,
        };

    private async Task<SystemMediaDetails> MediaAsync(DateTimeOffset now, CancellationToken ct)
    {
        var items = _dbContext.MediaItems.AsNoTracking();
        var recentFailuresSince = now - RecentFailureWindow;

        var counts = await items
            .GroupBy(item => new { item.Kind, item.State })
            .Select(group => new MediaCountSummary
            {
                Kind = group.Key.Kind,
                State = group.Key.State,
                Count = group.Count(),
            })
            .ToListAsync(ct);
        var failed = await items
            .Where(item => item.State == MediaItemState.Failed)
            .OrderByDescending(item => item.UpdatedAt)
            .ThenByDescending(item => item.Id)
            .Take(ShownFailedMedia)
            .Select(item => new FailedMediaSummary
            {
                MediaItemId = item.Id,
                OwnerKind = item.OwnerKind,
                FileName = item.OriginalFileName,
                Reason = item.FailureReason ?? "",
                FailedAt = item.UpdatedAt,
            })
            .ToListAsync(ct);

        return new SystemMediaDetails
        {
            Counts = [.. counts.OrderBy(count => count.Kind).ThenBy(count => count.State)],
            TotalBytes = await items.SumAsync(item => item.ByteSize, ct),
            Failed = failed,
            FailedInLastDay = await items.CountAsync(
                item =>
                    item.State == MediaItemState.Failed && item.UpdatedAt >= recentFailuresSince,
                ct
            ),
        };
    }

    private async Task<MediaQueueDetails> QueueAsync(DateTimeOffset now, CancellationToken ct)
    {
        var jobs = _dbContext.MediaJobs.AsNoTracking();
        var running = jobs.Where(job => job.ClaimedAt != null && job.LeaseExpiresAt >= now);
        var waiting = jobs.Where(job => job.ClaimedAt == null || job.LeaseExpiresAt < now);

        return new MediaQueueDetails
        {
            Queued = await waiting.CountAsync(job => job.Attempts == 0, ct),
            Running = await running.CountAsync(ct),
            Retrying = await waiting.CountAsync(job => job.Attempts > 0, ct),
            OldestQueuedAt = await waiting
                .Where(job => job.AvailableAt <= now)
                .Select(job => (DateTimeOffset?)job.AvailableAt)
                .MinAsync(ct),
        };
    }

    private async Task<IReadOnlyList<MediaWorkerSummary>> WorkersAsync(
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var heartbeats = await _dbContext
            .MediaWorkerHeartbeats.AsNoTracking()
            .OrderBy(heartbeat => heartbeat.StartedAt)
            .ThenBy(heartbeat => heartbeat.HostName)
            .ToListAsync(ct);

        return [.. heartbeats.Select(heartbeat => SummaryOf(heartbeat, now))];
    }

    private async Task<MailOutboxDetails> MailAsync(CancellationToken ct)
    {
        var outbox = _dbContext.OutboxMails.AsNoTracking();
        return new MailOutboxDetails
        {
            Pending = await outbox.CountAsync(ct),
            Retrying = await outbox.CountAsync(mail => mail.Attempt > 1, ct),
            OldestPendingAt = await outbox
                .Select(mail => (DateTimeOffset?)mail.EnqueuedAt)
                .MinAsync(ct),
        };
    }

    private static MediaWorkerSummary SummaryOf(
        MediaWorkerHeartbeat heartbeat,
        DateTimeOffset now
    ) =>
        new()
        {
            InstanceId = heartbeat.InstanceId,
            HostName = heartbeat.HostName,
            Version = heartbeat.Version,
            HardwareAcceleration = heartbeat.HardwareAcceleration,
            StartedAt = heartbeat.StartedAt,
            LastSeenAt = heartbeat.LastSeenAt,
            IsAlive = MediaWorkerLiveness.IsAlive(heartbeat.LastSeenAt, now),
            PhotoMediaItemId = heartbeat.PhotoMediaItemId,
            VideoMediaItemId = heartbeat.VideoMediaItemId,
            AudioMediaItemId = heartbeat.AudioMediaItemId,
        };
}
