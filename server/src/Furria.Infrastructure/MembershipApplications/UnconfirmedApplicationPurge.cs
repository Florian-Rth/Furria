using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.MembershipApplications;

public sealed class UnconfirmedApplicationPurge : BackgroundService
{
    private static readonly TimeSpan SweepInterval = BackgroundJobSchedule.Every(
        BackgroundJob.UnconfirmedApplicationPurge
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<UnconfirmedApplicationPurge> _logger;

    public UnconfirmedApplicationPurge(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<UnconfirmedApplicationPurge> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task SweepAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(
                BackgroundJob.UnconfirmedApplicationPurge,
                () => DeleteDueAsync(ct)
            );
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Unconfirmed membership applications not purged, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    private async Task DeleteDueAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope
            .ServiceProvider.GetRequiredService<MembershipApplicationService>()
            .DeleteUnconfirmedExpiredAsync(ct);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(SweepInterval, _timeProvider);
        do
        {
            await SweepAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
