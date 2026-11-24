using System.Diagnostics.Contracts;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppOutboxDelivery
{
    private const string SendSavepoint = "send";
    private const string EventWithoutStartMessage = "A WhatsApp event operation carries no start.";
    private const string NoTargetMessage = "A WhatsApp operation on a sent message names none.";

    private static readonly TimeSpan FailedKeptFor = TimeSpan.FromDays(30);

    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;
    private readonly WhatsAppGroupKeeping _keeping;
    private readonly WhatsAppPacing _pacing;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppOutboxDelivery> _logger;

    public WhatsAppOutboxDelivery(
        AppDbContext dbContext,
        WahaClient waha,
        WhatsAppGroupKeeping keeping,
        WhatsAppPacing pacing,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider,
        ILogger<WhatsAppOutboxDelivery> logger
    )
    {
        _dbContext = dbContext;
        _waha = waha;
        _keeping = keeping;
        _pacing = pacing;
        _options = options;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<WhatsAppSendOutcome> SendNextAsync(
        WhatsAppSendLane lane,
        CancellationToken ct
    )
    {
        if (!_options.Value.IsConfigured || await IsSessionDownAsync(ct))
            return WhatsAppSendOutcome.Idle;

        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var operation = await ClaimDueAsync(lane, now, ct);
        if (operation is null)
            return WhatsAppSendOutcome.Idle;

        await transaction.CreateSavepointAsync(SendSavepoint, ct);
        WhatsAppSent sent;
        try
        {
            sent = await SendAsync(operation, ct);
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

        if (sent.AddOutcome is { } addOutcome)
            await _keeping.RecordAddAsync(operation, addOutcome, ct);
        else if (WhatsAppOperations.IsKeptAsPost(operation.Operation))
            await RecordPostAsync(operation, sent.MessageId, now, ct);
        _dbContext.OutboxWhatsApps.Remove(operation);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        if (sent.AddOutcome == WahaAddOutcome.Refused)
            await _keeping.FetchInviteLinkForRefusedAsync(operation.ChatId, ct);
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

    private Task<OutboxWhatsApp?> ClaimDueAsync(
        WhatsAppSendLane lane,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var isPrivateReply = lane == WhatsAppSendLane.PrivateReplies;
        return _dbContext
            .OutboxWhatsApps.FromSql(
                $"""
                SELECT * FROM outbox_whatsapp AS head
                WHERE head.failed_at IS NULL
                  AND (head.next_attempt_at IS NULL OR head.next_attempt_at <= {now})
                  AND (head.operation = 'PrivateReply') = {isPrivateReply}
                  AND NOT EXISTS (
                      SELECT 1 FROM outbox_whatsapp AS earlier
                      WHERE earlier.chat_id = head.chat_id
                        AND (earlier.operation = 'AddParticipant') = (head.operation = 'AddParticipant')
                        AND (earlier.operation = 'PrivateReply') = (head.operation = 'PrivateReply')
                        AND earlier.failed_at IS NULL
                        AND earlier.id < head.id
                  )
                ORDER BY head.id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);
    }

    private async Task<WhatsAppSent> SendAsync(OutboxWhatsApp operation, CancellationToken ct)
    {
        switch (operation.Operation)
        {
            case WhatsAppOperation.SendPoll:
                return WhatsAppSent.Message(await _waha.SendPollAsync(PollOf(operation), ct));
            case WhatsAppOperation.SendEvent:
                return WhatsAppSent.Message(await _waha.SendEventAsync(EventOf(operation), ct));
            case WhatsAppOperation.EditText:
                await _waha.EditTextAsync(
                    operation.ChatId,
                    TargetOf(operation),
                    operation.Text,
                    ct
                );
                return WhatsAppSent.Message(null);
            case WhatsAppOperation.Delete:
                await _waha.DeleteMessageAsync(operation.ChatId, TargetOf(operation), ct);
                return WhatsAppSent.Message(null);
            case WhatsAppOperation.PrivateReply:
                return WhatsAppSent.Message(await ReplyPrivatelyAsync(operation, ct));
            case WhatsAppOperation.AddParticipant:
                return WhatsAppSent.Add(
                    await _waha.AddParticipantAsync(operation.ChatId, operation.Text, ct)
                );
            default:
                return WhatsAppSent.Message(await _waha.SendTextAsync(TextOf(operation), ct));
        }
    }

    private async Task<string?> ReplyPrivatelyAsync(OutboxWhatsApp operation, CancellationToken ct)
    {
        await TryTypingAsync(() => _waha.StartTypingAsync(operation.ChatId, ct), ct);
        await Task.Delay(_pacing.ReplyDelay(), ct);
        await TryTypingAsync(() => _waha.StopTypingAsync(operation.ChatId, ct), ct);
        return await _waha.SendTextAsync(TextOf(operation), ct);
    }

    private async Task TryTypingAsync(Func<Task> typing, CancellationToken ct)
    {
        try
        {
            await typing();
        }
        catch (Exception exception)
            when (exception is WahaCallFailedException or HttpRequestException
                || (exception is TaskCanceledException && !ct.IsCancellationRequested)
            )
        {
            _logger.LogInformation(exception, "WhatsApp typing indicator could not be shown");
        }
    }

    [Pure]
    private static string TargetOf(OutboxWhatsApp operation) =>
        operation.TargetMessageId ?? throw new InvalidOperationException(NoTargetMessage);

    [Pure]
    private static WahaOutgoingText TextOf(OutboxWhatsApp operation) =>
        new()
        {
            ChatId = operation.ChatId,
            Text = operation.Text,
            ReplyTo = operation.TargetMessageId,
            Mentions = operation.Mentions,
        };

    [Pure]
    private static WahaOutgoingPoll PollOf(OutboxWhatsApp operation) =>
        new()
        {
            ChatId = operation.ChatId,
            Question = operation.Text,
            Options = operation.PollOptions,
            AllowsSeveralAnswers = operation.AllowsSeveralAnswers,
        };

    [Pure]
    private static WahaOutgoingEvent EventOf(OutboxWhatsApp operation) =>
        new()
        {
            ChatId = operation.ChatId,
            Name = operation.Text,
            StartsAt =
                operation.EventStartsAt
                ?? throw new InvalidOperationException(EventWithoutStartMessage),
            EndsAt = operation.EventEndsAt,
            Place = operation.EventPlace,
        };

    private async Task RecordPostAsync(
        OutboxWhatsApp operation,
        string? messageId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (messageId is null)
        {
            _logger.LogWarning(
                "WhatsApp operation {OutboxWhatsAppId} was sent but WAHA named no message id",
                operation.Id
            );
            return;
        }

        var record = await RepostedRecordAsync(operation, ct) ?? NewRecordOf(operation);
        if (record.Id != 0)
            await _dbContext
                .WhatsAppAnswers.Where(answer => answer.WhatsAppMessageId == record.Id)
                .ExecuteDeleteAsync(ct);
        record.MessageId = messageId;
        record.MessageKey = WahaAnswerEvents.MessageKeyOf(messageId);
        record.Text = operation.Text;
        record.PollOptions = [.. operation.PollOptions];
        record.PollOptionIds = [.. operation.PollOptionIds];
        record.SentAt = now;
        record.ResultToldAt = null;
    }

    private async Task<WhatsAppMessage?> RepostedRecordAsync(
        OutboxWhatsApp operation,
        CancellationToken ct
    ) =>
        operation.AddOnKind is { } addOnKind
            ? await _dbContext.WhatsAppMessages.SingleOrDefaultAsync(
                record =>
                    record.HostKind == operation.HostKind
                    && record.HostId == operation.HostId
                    && record.AddOnKind == addOnKind
                    && record.AddOnId == operation.AddOnId,
                ct
            )
            : null;

    private WhatsAppMessage NewRecordOf(OutboxWhatsApp operation)
    {
        var record = new WhatsAppMessage
        {
            ChatId = operation.ChatId,
            HostKind = operation.HostKind,
            HostId = operation.HostId,
            AddOnKind = operation.AddOnKind,
            AddOnId = operation.AddOnId,
        };
        _dbContext.WhatsAppMessages.Add(record);
        return record;
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
