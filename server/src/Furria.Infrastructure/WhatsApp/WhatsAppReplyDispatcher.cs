using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppReplyDispatcher : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.WhatsAppReplies;

    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(Job);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly WhatsAppReplySignal _signal;
    private readonly WhatsAppPacing _pacing;
    private readonly BackgroundRuns _runs;
    private readonly ILogger<WhatsAppReplyDispatcher> _logger;

    public WhatsAppReplyDispatcher(
        IServiceScopeFactory scopeFactory,
        WhatsAppReplySignal signal,
        WhatsAppPacing pacing,
        BackgroundRuns runs,
        ILogger<WhatsAppReplyDispatcher> logger
    )
    {
        _scopeFactory = scopeFactory;
        _signal = signal;
        _pacing = pacing;
        _runs = runs;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ReplyDueAsync(stoppingToken);
            await _signal.WaitAsync(PollInterval, stoppingToken);
        }
    }

    private async Task ReplyDueAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => ReplyAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "WhatsApp private replies unreachable");
        }
    }

    private async Task ReplyAllAsync(CancellationToken ct)
    {
        while (!_pacing.IsPaused && await ReplyNextAsync(ct)) { }
    }

    private async Task<bool> ReplyNextAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var delivery = scope.ServiceProvider.GetRequiredService<WhatsAppOutboxDelivery>();
        switch (await delivery.SendNextAsync(WhatsAppSendLane.PrivateReplies, ct))
        {
            case WhatsAppSendOutcome.Sent:
            case WhatsAppSendOutcome.Failed:
                return true;
            case WhatsAppSendOutcome.RateLimited:
                _pacing.BackOff();
                return false;
            default:
                return false;
        }
    }
}
