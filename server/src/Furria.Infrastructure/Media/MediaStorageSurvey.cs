using System.Diagnostics.Contracts;
using Furria.Application.Operations;
using Furria.Core.Media;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Media;

public sealed class MediaStorageSurvey : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.MediaStorageSurvey;

    private static readonly TimeSpan Cadence = BackgroundJobSchedule.Every(Job);
    private static readonly TimeSpan FirstRunDelay = BackgroundJobSchedule.FirstRunDelayOf(Job);
    private static readonly EnumerationOptions EveryFile = new()
    {
        RecurseSubdirectories = true,
        IgnoreInaccessible = true,
        AttributesToSkip = FileAttributes.None,
    };

    private readonly MediaRoot _root;
    private readonly MediaStorageSnapshot _snapshot;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MediaStorageSurvey> _logger;

    public MediaStorageSurvey(
        MediaRoot root,
        MediaStorageSnapshot snapshot,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<MediaStorageSurvey> logger
    )
    {
        _root = root;
        _snapshot = snapshot;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task SurveyAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => Task.Run(Measure, ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Media storage not surveyed, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(FirstRunDelay, _timeProvider, stoppingToken);
        using var timer = new PeriodicTimer(Cadence, _timeProvider);
        do
        {
            await SurveyAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private void Measure()
    {
        var originals = TallyOf(MediaPaths.OriginalsDirectory);
        var renditions = TallyOf(MediaPaths.RenditionsDirectory);
        var staging = TallyOf(MediaPaths.StagingDirectory);
        _snapshot.Record(
            new StorageSurveyDetails
            {
                MeasuredAt = _timeProvider.GetUtcNow(),
                CadenceSeconds = (int)Cadence.TotalSeconds,
                Originals = originals,
                Renditions = renditions,
                Staging = staging,
            }
        );
    }

    private StorageTally TallyOf(string relativePath)
    {
        var directory = new DirectoryInfo(_root.FullPathOf(relativePath));
        return directory.Exists
            ? TallyOf(directory.EnumerateFiles("*", EveryFile))
            : StorageTally.Empty;
    }

    [Pure]
    private static StorageTally TallyOf(IEnumerable<FileInfo> files)
    {
        long bytes = 0;
        var count = 0;
        foreach (var file in files)
        {
            bytes += file.Length;
            count++;
        }

        return new StorageTally { Bytes = bytes, Files = count };
    }
}
