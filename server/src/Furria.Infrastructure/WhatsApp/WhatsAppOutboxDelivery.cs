using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppOutboxDelivery
{
    private const string SendSavepoint = "send";

    private static readonly TimeSpan FailedKeptFor = TimeSpan.FromDays(30);

    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppOutboxDelivery> _logger;

    public WhatsAppOutboxDelivery(
        AppDbContext dbContext,
        WahaClient waha,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider,
        ILogger<WhatsAppOutboxDelivery> logger
    )
    {
        _dbContext = dbContext;
        _waha = waha;
        _options = options;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<WhatsAppSendOutcome> SendNextAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured || await IsSessionDownAsync(ct))
            return WhatsAppSendOutcome.Idle;

        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var operation = await ClaimDueAsync(now, ct);
        if (operation is null)
            return WhatsAppSendOutcome.Idle;

        await transaction.CreateSavepointAsync(SendSavepoint, ct);
        string? messageId;
        try
        {
            messageId = await SendAsync(operation, ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            await transaction.RollbackToSavepointAsync(SendSavepoint, ct);
            var outcome = await RetryOrFailAsync(
                operation,
                exception,
                _timeProvider.GetUtcNow(),
                ct
            );
            await transaction.CommitAsync(ct);
            return outcome;
        }

        RecordPost(operation, messageId, now);
        _dbContext.OutboxWhatsApps.Remove(operation);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return WhatsAppSendOutcome.Sent;
    }

    public Task PurgeFailedAsync(CancellationToken ct)
    {
        var keptSince = _timeProvider.GetUtcNow() - FailedKeptFor;
        return _dbContext
            .OutboxWhatsApps.Where(operation => operation.FailedAt < keptSince)
            .ExecuteDeleteAsync(ct);
    }

    private Task<bool> IsSessionDownAsync(CancellationToken ct) =>
        _dbContext.WhatsAppSessions.AnyAsync(
            session =>
                session.Name == _options.Value.Session
                && session.Status != WhatsAppSessionStatus.Working,
            ct
        );

    private Task<OutboxWhatsApp?> ClaimDueAsync(DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .OutboxWhatsApps.FromSql(
                $"""
                SELECT * FROM outbox_whatsapp AS head
                WHERE head.failed_at IS NULL
                  AND (head.next_attempt_at IS NULL OR head.next_attempt_at <= {now})
                  AND NOT EXISTS (
                      SELECT 1 FROM outbox_whatsapp AS earlier
                      WHERE earlier.chat_id = head.chat_id
                        AND earlier.failed_at IS NULL
                        AND earlier.id < head.id
                  )
                ORDER BY head.id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private Task<string?> SendAsync(OutboxWhatsApp operation, CancellationToken ct) =>
        _waha.SendTextAsync(
            new WahaOutgoingText
            {
                ChatId = operation.ChatId,
                Text = operation.Text,
                Mentions = operation.Mentions,
            },
            ct
        );

    private void RecordPost(OutboxWhatsApp operation, string? messageId, DateTimeOffset now)
    {
        if (messageId is null)
        {
            _logger.LogWarning(
                "WhatsApp operation {OutboxWhatsAppId} was sent but WAHA named no message id",
                operation.Id
            );
            return;
        }

        _dbContext.WhatsAppMessages.Add(
            new WhatsAppMessage
            {
                ChatId = operation.ChatId,
                MessageId = messageId,
                HostKind = operation.HostKind,
                HostId = operation.HostId,
                SentAt = now,
            }
        );
    }

    private async Task<WhatsAppSendOutcome> RetryOrFailAsync(
        OutboxWhatsApp operation,
        Exception exception,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.ChangeTracker.Clear();
        var claimed = _dbContext.OutboxWhatsApps.Where(row => row.Id == operation.Id);

        if (exception is WahaCallFailedException { IsRateSignal: true })
        {
            _logger.LogWarning(
                exception,
                "WhatsApp operation {OutboxWhatsAppId} hit a rate signal, backing off",
                operation.Id
            );
            return WhatsAppSendOutcome.RateLimited;
        }

        var error = ErrorOf(exception);
        if (WhatsAppOutboxRetrySchedule.DelayAfterFailed(operation.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                exception,
                "WhatsApp operation {OutboxWhatsAppId} failed for good after {AttemptCount} attempts",
                operation.Id,
                operation.Attempt
            );
            await claimed.ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(row => row.FailedAt, now)
                        .SetProperty(row => row.LastError, error),
                ct
            );
            return WhatsAppSendOutcome.Failed;
        }

        _logger.LogWarning(
            exception,
            "WhatsApp operation {OutboxWhatsAppId} failed on attempt {AttemptNumber}, retrying in {RetryDelay}",
            operation.Id,
            operation.Attempt,
            delay
        );
        await claimed.ExecuteUpdateAsync(
            setters =>
                setters
                    .SetProperty(row => row.Attempt, operation.Attempt + 1)
                    .SetProperty(row => row.NextAttemptAt, now + delay)
                    .SetProperty(row => row.LastError, error),
            ct
        );
        return WhatsAppSendOutcome.Failed;
    }

    private static string ErrorOf(Exception exception) =>
        exception.Message[..Math.Min(exception.Message.Length, OutboxWhatsApp.ErrorLength)];
}
