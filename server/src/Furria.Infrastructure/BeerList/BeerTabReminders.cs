using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerTabReminders : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.BeerTabReminders;

    private static readonly TimeSpan RemindInterval = BackgroundJobSchedule.Every(Job);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<BeerTabReminders> _logger;

    public BeerTabReminders(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<BeerTabReminders> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    private async Task RemindDueTabsAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope
            .ServiceProvider.GetRequiredService<BeerTabReminderService>()
            .RemindDueTabsAsync(ct);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(RemindInterval, _timeProvider);
        do
        {
            await RemindAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public async Task RemindAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => RemindDueTabsAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Open beer tabs not reminded, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
