using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.RunningOrders;

public sealed class ActCastFreeze : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.ActCastFreeze;

    private static readonly TimeSpan FreezeInterval = BackgroundJobSchedule.Every(Job);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<ActCastFreeze> _logger;

    public ActCastFreeze(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<ActCastFreeze> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    private async Task FreezeClosedCastsAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ActService>().FreezeClosedCastsAsync(ct);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(FreezeInterval, _timeProvider);
        do
        {
            await FreezeAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public async Task FreezeAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => FreezeClosedCastsAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Casts of closed sessions not frozen, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
