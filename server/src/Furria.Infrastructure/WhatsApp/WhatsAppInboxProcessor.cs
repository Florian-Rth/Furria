using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppInboxProcessor
{
    private static readonly TimeSpan ProcessedRetention = TimeSpan.FromDays(7);

    private readonly AppDbContext _dbContext;
    private readonly WhatsAppSessionTracker _sessionTracker;
    private readonly WhatsAppAnswers _answers;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppInboxProcessor> _logger;

    public WhatsAppInboxProcessor(
        AppDbContext dbContext,
        WhatsAppSessionTracker sessionTracker,
        WhatsAppAnswers answers,
        TimeProvider timeProvider,
        ILogger<WhatsAppInboxProcessor> logger
    )
    {
        _dbContext = dbContext;
        _sessionTracker = sessionTracker;
        _answers = answers;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> ApplyNextAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var inboxEvent = await ClaimDueAsync(now, ct);
        if (inboxEvent is null)
            return false;

        try
        {
            await ApplyAsync(inboxEvent, ct);
            inboxEvent.ProcessedAt = now;
            await _dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            await transaction.RollbackAsync(ct);
            await RetryOrAbandonAsync(inboxEvent, exception, now, ct);
        }

        return true;
    }

    public Task PurgeProcessedAsync(CancellationToken ct)
    {
        var cutoff = _timeProvider.GetUtcNow() - ProcessedRetention;
        return _dbContext
            .InboxWhatsAppEvents.Where(row => row.ProcessedAt < cutoff)
            .ExecuteDeleteAsync(ct);
    }

    private Task ApplyAsync(InboxWhatsAppEvent inboxEvent, CancellationToken ct) =>
        inboxEvent.Event switch
        {
            WahaEvents.SessionStatus => _sessionTracker.TrackAsync(inboxEvent, ct),
            WahaEvents.PollVote or WahaEvents.EventResponse => _answers.ApplyAsync(inboxEvent, ct),
            WahaEvents.PollVoteFailed => LoggedFailedVote(inboxEvent),
            _ => Task.CompletedTask,
        };

    private Task LoggedFailedVote(InboxWhatsAppEvent inboxEvent)
    {
        _logger.LogWarning(
            "WhatsApp could not decrypt a poll vote ({InboxEventId}); it counts for nothing",
            inboxEvent.Id
        );
        return Task.CompletedTask;
    }

    private Task<InboxWhatsAppEvent?> ClaimDueAsync(DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .InboxWhatsAppEvents.FromSql(
                $"""
                SELECT * FROM inbox_whatsapp
                WHERE processed_at IS NULL
                  AND (next_attempt_at IS NULL OR next_attempt_at <= {now})
                ORDER BY id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private async Task RetryOrAbandonAsync(
        InboxWhatsAppEvent inboxEvent,
        Exception exception,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.ChangeTracker.Clear();
        var claimed = _dbContext.InboxWhatsAppEvents.Where(row => row.Id == inboxEvent.Id);

        if (WhatsAppInboxRetrySchedule.DelayAfterFailed(inboxEvent.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                exception,
                "WhatsApp event {InboxEventId} ({WahaEvent}) abandoned after {AttemptCount} attempts",
                inboxEvent.Id,
                inboxEvent.Event,
                inboxEvent.Attempt
            );
            await claimed.ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.ProcessedAt, now),
                ct
            );
            return;
        }

        _logger.LogWarning(
            exception,
            "WhatsApp event {InboxEventId} ({WahaEvent}) failed on attempt {AttemptNumber}, retrying in {RetryDelay}",
            inboxEvent.Id,
            inboxEvent.Event,
            inboxEvent.Attempt,
            delay
        );
        await claimed.ExecuteUpdateAsync(
            setters =>
                setters
                    .SetProperty(row => row.Attempt, inboxEvent.Attempt + 1)
                    .SetProperty(row => row.NextAttemptAt, now + delay),
            ct
        );
    }
}
