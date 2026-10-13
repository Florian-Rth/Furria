using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Events;

public sealed class PastTicketRequestPurge : BackgroundService
{
    private static readonly TimeSpan SweepInterval = BackgroundJobSchedule.Every(
        BackgroundJob.PastTicketRequestPurge
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<PastTicketRequestPurge> _logger;

    public PastTicketRequestPurge(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<PastTicketRequestPurge> logger
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
            await _runs.TrackAsync(BackgroundJob.PastTicketRequestPurge, () => DeleteDueAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Ticket requests of past events not purged, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    private async Task DeleteDueAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope
            .ServiceProvider.GetRequiredService<TicketRequestService>()
            .DeleteOfPastEventsAsync(ct);
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
