using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Gallery;

public sealed class GalleryBinPurge : BackgroundService
{
    private static readonly TimeSpan PurgeInterval = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<GalleryBinPurge> _logger;

    public GalleryBinPurge(
        IServiceScopeFactory scopeFactory,
        TimeProvider timeProvider,
        ILogger<GalleryBinPurge> logger
    )
    {
        _scopeFactory = scopeFactory;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task PurgeAsync(CancellationToken ct)
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
