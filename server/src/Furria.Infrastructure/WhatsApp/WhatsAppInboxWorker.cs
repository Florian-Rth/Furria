using Furria.Application.Operations;
using Furria.Infrastructure.Assistant;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppInboxWorker : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.WhatsAppInbox;

    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(Job);
    private static readonly TimeSpan ConversationPurgeEvery = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly WhatsAppInboxSignal _signal;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppInboxWorker> _logger;
    private DateTimeOffset _conversationsPurgedAt = DateTimeOffset.MinValue;

    public WhatsAppInboxWorker(
        IServiceScopeFactory scopeFactory,
        WhatsAppInboxSignal signal,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        ILogger<WhatsAppInboxWorker> logger
    )
    {
        _scopeFactory = scopeFactory;
        _signal = signal;
        _runs = runs;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ApplyDueAsync(stoppingToken);
            await _signal.WaitAsync(PollInterval, stoppingToken);
        }
    }

    private async Task ApplyDueAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => ApplyAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "WhatsApp inbox unreachable");
        }
    }

    private async Task ApplyAllAsync(CancellationToken ct)
    {
        while (await InScopeAsync(inbox => inbox.ApplyNextAsync(ct))) { }
        await InScopeAsync(async inbox =>
        {
            await inbox.PurgeProcessedAsync(ct);
            return true;
        });
        await PurgeConversationsWhenDueAsync(ct);
    }

    private async Task PurgeConversationsWhenDueAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        if (now - _conversationsPurgedAt < ConversationPurgeEvery)
            return;

        _conversationsPurgedAt = now;
        await using var scope = _scopeFactory.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ClubAssistantReception>().PurgeAsync(ct);
    }

    private async Task<bool> InScopeAsync(Func<WhatsAppInboxProcessor, Task<bool>> step)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();

        return await step(scope.ServiceProvider.GetRequiredService<WhatsAppInboxProcessor>());
    }
}
