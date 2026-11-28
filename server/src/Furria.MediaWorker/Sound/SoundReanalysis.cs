using Furria.Core.Sound;
using Furria.Infrastructure.Media;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.MediaWorker.Sound;

public sealed class SoundReanalysis : BackgroundService
{
    private static readonly TimeSpan RetryInterval = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<SoundReanalysis> _logger;

    public SoundReanalysis(
        IServiceScopeFactory scopeFactory,
        TimeProvider timeProvider,
        ILogger<SoundReanalysis> logger
    )
    {
        _scopeFactory = scopeFactory;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task QueueOutdatedAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var queued = await scope
            .ServiceProvider.GetRequiredService<MediaJobQueue>()
            .QueueOutdatedSoundAsync(SoundAnalysis.Version, ct);
        if (queued > 0)
            _logger.LogInformation(
                "{MediaItemCount} sounds queued for analysis version {AnalysisVersion}",
                queued,
                SoundAnalysis.Version
            );
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!await TryQueueOutdatedAsync(stoppingToken))
            await Task.Delay(RetryInterval, _timeProvider, stoppingToken);
    }

    private async Task<bool> TryQueueOutdatedAsync(CancellationToken ct)
    {
        try
        {
            await QueueOutdatedAsync(ct);
            return true;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                exception,
                "Outdated sounds not queued, retrying in {RetryInterval}",
                RetryInterval
            );
            return false;
        }
    }
}
