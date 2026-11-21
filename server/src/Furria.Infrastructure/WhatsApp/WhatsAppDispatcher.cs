using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppDispatcher : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.WhatsAppDispatcher;

    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(Job);
    private static readonly TimeSpan PurgeEvery = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly WhatsAppOutboxSignal _signal;
    private readonly WhatsAppPacing _pacing;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppDispatcher> _logger;
    private DateTimeOffset _purgedAt = DateTimeOffset.MinValue;

    public WhatsAppDispatcher(
        IServiceScopeFactory scopeFactory,
        WhatsAppOutboxSignal signal,
        WhatsAppPacing pacing,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<WhatsAppDispatcher> logger
    )
    {
        _scopeFactory = scopeFactory;
        _signal = signal;
        _pacing = pacing;
        _runs = runs;
        _timeProvider = timeProvider;
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
            await _runs.TrackAsync(Job, () => DispatchAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "WhatsApp outbox unreachable");
        }
    }

    private async Task DispatchAllAsync(CancellationToken ct)
    {
        await StageResultsAsync(ct);
        while (!_pacing.IsPaused && await SendNextPacedAsync(ct)) { }
        await PurgeWhenDueAsync(ct);
    }

    private async Task StageResultsAsync(CancellationToken ct)
    {
        try
        {
            await InScopeAsync<WhatsAppResults>(results => results.StageDueAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "WhatsApp results could not be staged");
        }
    }

    private async Task PurgeWhenDueAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        if (now - _purgedAt < PurgeEvery)
            return;

        _purgedAt = now;
        await InScopeAsync<WhatsAppOutboxDelivery>(delivery => delivery.PurgeFailedAsync(ct));
    }

    private async Task<bool> SendNextPacedAsync(CancellationToken ct)
    {
        switch (await InScopeAsync(delivery => delivery.SendNextAsync(ct)))
        {
            case WhatsAppSendOutcome.Sent:
                await WaitAsync(_pacing.GapAfterSend(), ct);
                return true;
            case WhatsAppSendOutcome.Failed:
                return true;
            case WhatsAppSendOutcome.RateLimited:
                _pacing.BackOff();
                return false;
            default:
                return false;
        }
    }

    private static Task WaitAsync(TimeSpan gap, CancellationToken ct) =>
        gap > TimeSpan.Zero ? Task.Delay(gap, ct) : Task.CompletedTask;

    private async Task<WhatsAppSendOutcome> InScopeAsync(
        Func<WhatsAppOutboxDelivery, Task<WhatsAppSendOutcome>> step
    )
    {
        await using var scope = _scopeFactory.CreateAsyncScope();

        return await step(scope.ServiceProvider.GetRequiredService<WhatsAppOutboxDelivery>());
    }

    private async Task InScopeAsync<TStep>(Func<TStep, Task> step)
        where TStep : notnull
    {
        await using var scope = _scopeFactory.CreateAsyncScope();

        await step(scope.ServiceProvider.GetRequiredService<TStep>());
    }
}
