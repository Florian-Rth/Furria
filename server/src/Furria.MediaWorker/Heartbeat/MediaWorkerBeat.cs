using Furria.Application.Operations;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Operations;
using Furria.MediaWorker.Jobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.MediaWorker.Heartbeat;

public sealed class MediaWorkerBeat : BackgroundService
{
    private static readonly TimeSpan RemovalTimeout = TimeSpan.FromSeconds(5);

    private readonly Guid _instanceId = Guid.NewGuid();
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MediaWorkerActivity _activity;
    private readonly string _hardwareAcceleration;
    private readonly TimeProvider _timeProvider;
    private readonly DateTimeOffset _startedAt;
    private readonly ILogger<MediaWorkerBeat> _logger;

    public MediaWorkerBeat(
        IServiceScopeFactory scopeFactory,
        MediaWorkerActivity activity,
        IOptions<MediaWorkerOptions> options,
        TimeProvider timeProvider,
        ILogger<MediaWorkerBeat> logger
    )
    {
        _scopeFactory = scopeFactory;
        _activity = activity;
        _hardwareAcceleration = options.Value.HardwareAcceleration.ToString().ToLowerInvariant();
        _timeProvider = timeProvider;
        _startedAt = timeProvider.GetUtcNow();
        _logger = logger;
    }

    public async Task BeatAsync(CancellationToken ct)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            await scope
                .ServiceProvider.GetRequiredService<MediaWorkerHeartbeats>()
                .BeatAsync(CurrentBeat(), ct);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Media worker heartbeat not written, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        await base.StopAsync(cancellationToken);
        await RemoveAsync();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(MediaWorkerLiveness.BeatInterval, _timeProvider);
        do
        {
            await BeatAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RemoveAsync()
    {
        try
        {
            using var timeout = new CancellationTokenSource(RemovalTimeout);
            await using var scope = _scopeFactory.CreateAsyncScope();
            await scope
                .ServiceProvider.GetRequiredService<MediaWorkerHeartbeats>()
                .RemoveAsync(_instanceId, timeout.Token);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(
                "Media worker heartbeat not removed, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    private MediaWorkerBeatCommand CurrentBeat() =>
        new()
        {
            InstanceId = _instanceId,
            HostName = Environment.MachineName,
            Version = FurriaVersion.Current,
            HardwareAcceleration = _hardwareAcceleration,
            StartedAt = _startedAt,
            PhotoMediaItemId = _activity.PhotoMediaItemId,
            VideoMediaItemId = _activity.VideoMediaItemId,
        };
}
