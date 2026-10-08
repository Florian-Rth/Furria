using Furria.Core.Media;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.MediaWorker.Jobs;

public sealed class MediaWorkerLane : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    private readonly MediaKind _kind;
    private readonly MediaJobRunner _runner;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MediaWorkerLane> _logger;

    public MediaWorkerLane(
        MediaKind kind,
        MediaJobRunner runner,
        TimeProvider timeProvider,
        ILogger<MediaWorkerLane> logger
    )
    {
        _kind = kind;
        _runner = runner;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await RunQueuedAsync(stoppingToken);
            await Task.Delay(PollInterval, _timeProvider, stoppingToken);
        }
    }

    private async Task RunQueuedAsync(CancellationToken ct)
    {
        try
        {
            while (await _runner.RunNextAsync(_kind, ct)) { }
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Media queue for {MediaKind} unreachable, failure {FailureType}",
                _kind,
                exception.GetType().Name
            );
        }
    }
}
