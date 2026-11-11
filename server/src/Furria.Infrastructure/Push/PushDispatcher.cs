using Furria.Application.Operations;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Push;

public sealed class PushDispatcher : BackgroundService
{
    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(
        BackgroundJob.PushDispatcher
    );

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly PushOutboxSignal _signal;
    private readonly BackgroundRuns _runs;
    private readonly ILogger<PushDispatcher> _logger;

    public PushDispatcher(
        IServiceScopeFactory scopeFactory,
        PushOutboxSignal signal,
        BackgroundRuns runs,
        ILogger<PushDispatcher> logger
    )
    {
        _scopeFactory = scopeFactory;
        _signal = signal;
        _runs = runs;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await DispatchDueAsync(stoppingToken);
            await _signal.WaitAsync(PollInterval, stoppingToken);
        }
    }

    private async Task DispatchDueAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(BackgroundJob.PushDispatcher, () => DispatchAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "Push outbox unreachable");
        }
    }

    private async Task DispatchAllAsync(CancellationToken ct)
    {
        while (await InScopeAsync<CalendarPushExpansion>(stage => stage.ExpandNextAsync(ct))) { }
        while (await InScopeAsync<PushOutboxDelivery>(stage => stage.DeliverNextAsync(ct))) { }
    }

    private async Task<bool> InScopeAsync<TStage>(Func<TStage, Task<bool>> step)
        where TStage : notnull
    {
        await using var scope = _scopeFactory.CreateAsyncScope();

        return await step(scope.ServiceProvider.GetRequiredService<TStage>());
    }
}
