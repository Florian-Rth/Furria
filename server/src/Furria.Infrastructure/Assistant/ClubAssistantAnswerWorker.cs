using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantAnswerWorker : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.ClubAssistantAnswers;

    private static readonly TimeSpan PollInterval = BackgroundJobSchedule.Every(Job);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ClubAssistantSignal _signal;
    private readonly BackgroundRuns _runs;
    private readonly ILogger<ClubAssistantAnswerWorker> _logger;

    public ClubAssistantAnswerWorker(
        IServiceScopeFactory scopeFactory,
        ClubAssistantSignal signal,
        BackgroundRuns runs,
        ILogger<ClubAssistantAnswerWorker> logger
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
            await AnswerDueAsync(stoppingToken);
            await _signal.WaitAsync(PollInterval, stoppingToken);
        }
    }

    private async Task AnswerDueAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => AnswerAllAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(exception, "Club assistant could not answer");
        }
    }

    private async Task AnswerAllAsync(CancellationToken ct)
    {
        while (await AnswerNextAsync(ct)) { }
    }

    private async Task<bool> AnswerNextAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        return await scope
            .ServiceProvider.GetRequiredService<ClubAssistantAnswers>()
            .AnswerNextAsync(ct);
    }
}
