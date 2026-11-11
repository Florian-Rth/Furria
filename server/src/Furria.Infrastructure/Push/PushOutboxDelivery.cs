using Furria.Application.Push;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Push;

public sealed class PushOutboxDelivery
{
    private readonly AppDbContext _dbContext;
    private readonly PushSender _pushSender;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<PushOutboxDelivery> _logger;

    public PushOutboxDelivery(
        AppDbContext dbContext,
        PushSender pushSender,
        TimeProvider timeProvider,
        ILogger<PushOutboxDelivery> logger
    )
    {
        _dbContext = dbContext;
        _pushSender = pushSender;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> DeliverNextAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var push = await ClaimDueAsync(now, ct);
        if (push is null)
            return false;

        try
        {
            await SendUnlessExpiredAsync(push, now, ct);
            _dbContext.OutboxPushes.Remove(push);
            await _dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            await transaction.RollbackAsync(ct);
            await RetryOrAbandonAsync(push, exception, now, ct);
        }

        return true;
    }

    private Task<OutboxPush?> ClaimDueAsync(DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .OutboxPushes.FromSql(
                $"""
                SELECT * FROM outbox_push
                WHERE next_attempt_at IS NULL OR next_attempt_at <= {now}
                ORDER BY id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private async Task SendUnlessExpiredAsync(
        OutboxPush push,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (push.ExpiresAt <= now)
        {
            _logger.LogInformation(
                "Push {OutboxPushId} to account {AccountId} expired before it was sent",
                push.Id,
                push.AccountId
            );
            return;
        }

        var delivery = await _pushSender.SendAsync(
            push.AccountId,
            new PushMessage
            {
                Title = push.Title,
                Body = push.Body,
                Url = push.Url,
                Tag = push.Tag,
                TimeToLive = push.ExpiresAt - now,
            },
            ct
        );
        _logger.LogInformation(
            "Push {OutboxPushId} to account {AccountId} reached {DeliveredDevices} devices",
            push.Id,
            push.AccountId,
            delivery.Delivered
        );
    }

    private async Task RetryOrAbandonAsync(
        OutboxPush push,
        Exception exception,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.ChangeTracker.Clear();
        var claimed = _dbContext.OutboxPushes.Where(row => row.Id == push.Id);

        if (PushRetrySchedule.DelayAfterFailed(push.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                exception,
                "Push {OutboxPushId} to account {AccountId} abandoned after {AttemptCount} attempts",
                push.Id,
                push.AccountId,
                push.Attempt
            );
            await claimed.ExecuteDeleteAsync(ct);
            return;
        }

        _logger.LogWarning(
            exception,
            "Push {OutboxPushId} to account {AccountId} failed on attempt {AttemptNumber}, retrying in {RetryDelay}",
            push.Id,
            push.AccountId,
            push.Attempt,
            delay
        );
        await claimed.ExecuteUpdateAsync(
            setters =>
                setters
                    .SetProperty(row => row.Attempt, push.Attempt + 1)
                    .SetProperty(row => row.NextAttemptAt, now + delay),
            ct
        );
    }
}
