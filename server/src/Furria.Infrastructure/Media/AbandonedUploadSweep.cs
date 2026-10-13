using System.Diagnostics.Contracts;
using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Media;

public sealed class AbandonedUploadSweep : BackgroundService
{
    private const char SidecarSeparator = '.';

    private const BackgroundJob Job = BackgroundJob.AbandonedUploadSweep;

    private static readonly TimeSpan SweepInterval = BackgroundJobSchedule.Every(Job);
    private static readonly TimeSpan AbandonedAfter = TimeSpan.FromHours(24);

    private readonly MediaRoot _root;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AbandonedUploadSweep> _logger;

    public AbandonedUploadSweep(
        MediaRoot root,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<AbandonedUploadSweep> logger
    )
    {
        _root = root;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public void Sweep()
    {
        try
        {
            _runs.Track(Job, DeleteAbandonedUploads);
        }
        catch (IOException exception)
        {
            _logger.LogWarning(
                "Abandoned uploads not swept, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(SweepInterval, _timeProvider);
        do
        {
            Sweep();
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private void DeleteAbandonedUploads()
    {
        var abandonedBefore = _timeProvider.GetUtcNow().UtcDateTime - AbandonedAfter;
        foreach (var upload in StagedUploads().Where(IsUntouchedSince(abandonedBefore)))
        foreach (var file in upload)
            file.Delete();
    }

    private IEnumerable<IGrouping<string, FileInfo>> StagedUploads()
    {
        var staging = new DirectoryInfo(_root.StagingPath);
        return staging.Exists ? staging.EnumerateFiles().GroupBy(UploadIdOf).ToList() : [];
    }

    [Pure]
    private static string UploadIdOf(FileInfo file) => file.Name.Split(SidecarSeparator)[0];

    [Pure]
    private static Func<IGrouping<string, FileInfo>, bool> IsUntouchedSince(DateTime instant) =>
        upload => upload.Max(file => file.LastWriteTimeUtc) < instant;
}
