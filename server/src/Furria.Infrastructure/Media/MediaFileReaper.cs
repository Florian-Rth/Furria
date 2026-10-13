using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Media;

public sealed class MediaFileReaper : BackgroundService
{
    private const int BatchSize = 100;

    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(
        BackgroundJob.MediaFileReaper
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MediaRoot _root;
    private readonly MediaFileReaperSignal _signal;
    private readonly BackgroundRuns _runs;
    private readonly ILogger<MediaFileReaper> _logger;

    public MediaFileReaper(
        IServiceScopeFactory scopeFactory,
        MediaRoot root,
        MediaFileReaperSignal signal,
        BackgroundRuns runs,
        ILogger<MediaFileReaper> logger
    )
    {
        _scopeFactory = scopeFactory;
        _root = root;
        _signal = signal;
        _runs = runs;
        _logger = logger;
    }

    public async Task ReapAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(BackgroundJob.MediaFileReaper, () => ReapAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Media file tombstones unreachable, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ReapAsync(stoppingToken);
            await _signal.WaitAsync(PollInterval, stoppingToken);
        }
    }

    private async Task ReapAllAsync(CancellationToken ct)
    {
        while (await ReapBatchAsync(ct)) { }
    }

    private async Task<bool> ReapBatchAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);

        var tombstones = await dbContext
            .MediaFileTombstones.FromSql(
                $"""
                SELECT * FROM media_file_tombstone
                ORDER BY buried_at
                LIMIT {BatchSize}
                FOR UPDATE SKIP LOCKED
                """
            )
            .ToListAsync(ct);
        if (tombstones.Count == 0)
            return false;

        var reaped = tombstones.Where(tombstone => FilesDeleted(tombstone.StorageKey)).ToList();

        dbContext.MediaFileTombstones.RemoveRange(reaped);
        await dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return tombstones.Count == BatchSize && reaped.Count == tombstones.Count;
    }

    private bool FilesDeleted(Guid storageKey)
    {
        try
        {
            _root.DeleteFilesOf(storageKey);
            return true;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            _logger.LogWarning(
                "Media files of a deleted item left behind, failure {FailureType}",
                exception.GetType().Name
            );
            return false;
        }
    }
}
