using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Gallery;

public sealed class GalleryBinPurge : BackgroundService
{
    private static readonly TimeSpan PurgeInterval = BackgroundJobSchedule.Every(
        BackgroundJob.GalleryBinPurge
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<GalleryBinPurge> _logger;

    public GalleryBinPurge(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<GalleryBinPurge> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public Task PurgeAsync(CancellationToken ct) =>
        _runs.TrackAsync(BackgroundJob.GalleryBinPurge, () => PurgeBinAsync(ct));

    private async Task PurgeBinAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var purged = await scope
            .ServiceProvider.GetRequiredService<GalleryService>()
            .PurgeBinAsync(ct);
        if (purged > 0)
            _logger.LogInformation("Gallery bin purged {PurgedCount} expired rows", purged);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(PurgeInterval, _timeProvider);
        do
        {
            await PurgeSafelyAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task PurgeSafelyAsync(CancellationToken ct)
    {
        try
        {
            await PurgeAsync(ct);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Gallery bin not purged, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
