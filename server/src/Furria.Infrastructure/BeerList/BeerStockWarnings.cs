using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerStockWarnings : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.BeerStockWarnings;

    private static readonly TimeSpan WarnInterval = BackgroundJobSchedule.Every(Job);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<BeerStockWarnings> _logger;

    public BeerStockWarnings(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<BeerStockWarnings> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    private async Task WarnIfRunningOutAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope
            .ServiceProvider.GetRequiredService<BeerStockWarningService>()
            .WarnIfRunningOutAsync(ct);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(WarnInterval, _timeProvider);
        do
        {
            await WarnAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public async Task WarnAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => WarnIfRunningOutAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Beer stock not checked for running out, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
