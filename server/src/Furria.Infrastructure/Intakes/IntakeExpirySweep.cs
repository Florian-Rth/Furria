using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Intakes;

public sealed class IntakeExpirySweep : BackgroundService
{
    private static readonly TimeSpan SweepInterval = BackgroundJobSchedule.Every(
        BackgroundJob.IntakeExpirySweep
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<IntakeExpirySweep> _logger;

    public IntakeExpirySweep(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<IntakeExpirySweep> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public Task SweepAsync(CancellationToken ct) =>
        _runs.TrackAsync(BackgroundJob.IntakeExpirySweep, () => PurgeLapsedAsync(ct));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(SweepInterval, _timeProvider);
        do
        {
            await SweepSafelyAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task PurgeLapsedAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<IntakeService>().PurgeLapsedAsync(ct);
    }

    private async Task SweepSafelyAsync(CancellationToken ct)
    {
        try
        {
            await SweepAsync(ct);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Lapsed intakes not purged, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
