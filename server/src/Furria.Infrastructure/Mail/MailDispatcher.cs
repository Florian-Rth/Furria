using System.Diagnostics.Contracts;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Mail;

public sealed class MailDispatcher : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MailService _mailService;
    private readonly MailOutboxSignal _signal;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MailDispatcher> _logger;

    public MailDispatcher(
        IServiceScopeFactory scopeFactory,
        MailService mailService,
        MailOutboxSignal signal,
        TimeProvider timeProvider,
        ILogger<MailDispatcher> logger
    )
    {
        _scopeFactory = scopeFactory;
        _mailService = mailService;
        _signal = signal;
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
            while (await DispatchNextAsync(ct)) { }
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Mail outbox unreachable, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    private async Task<bool> DispatchNextAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);

        var now = _timeProvider.GetUtcNow();
        var mail = await ClaimDueAsync(dbContext, now, ct);
        if (mail is null)
            return false;

        if (await TrySendAsync(mail, ct) is { } failureType)
            RetryOrAbandon(dbContext, mail, failureType, now);
        else
            dbContext.OutboxMails.Remove(mail);

        await dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return true;
    }

    private static Task<OutboxMail?> ClaimDueAsync(
        AppDbContext dbContext,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        dbContext
            .OutboxMails.FromSql(
                $"""
                SELECT * FROM outbox_mail
                WHERE next_attempt_at IS NULL OR next_attempt_at <= {now}
                ORDER BY id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private async Task<string?> TrySendAsync(OutboxMail mail, CancellationToken ct)
    {
        try
        {
            await _mailService.SendAsync(ToOutgoing(mail), ct);
            _logger.LogInformation(
                "Mail {MailTemplate} sent to {MailRecipientKind} {MailRecipientId}",
                mail.Template,
                mail.RecipientKind,
                mail.RecipientId
            );
            return null;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            return exception.GetType().Name;
        }
    }

    private void RetryOrAbandon(
        AppDbContext dbContext,
        OutboxMail mail,
        string failureType,
        DateTimeOffset now
    )
    {
        if (MailRetrySchedule.DelayAfterFailed(mail.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                "Mail {MailTemplate} to {MailRecipientKind} {MailRecipientId} abandoned after {AttemptCount} attempts, last failure {FailureType}",
                mail.Template,
                mail.RecipientKind,
                mail.RecipientId,
                mail.Attempt,
                failureType
            );
            dbContext.OutboxMails.Remove(mail);
            return;
        }

        _logger.LogWarning(
            "Mail {MailTemplate} to {MailRecipientKind} {MailRecipientId} failed on attempt {AttemptNumber} with {FailureType}, retrying in {RetryDelay}",
            mail.Template,
            mail.RecipientKind,
            mail.RecipientId,
            mail.Attempt,
            failureType,
            delay
        );
        mail.Attempt++;
        mail.NextAttemptAt = now + delay;
    }

    [Pure]
    private static OutgoingMail ToOutgoing(OutboxMail mail) =>
        new()
        {
            Template = mail.Template,
            Recipient = new MailRecipient { Kind = mail.RecipientKind, Id = mail.RecipientId },
            To = mail.To,
            Subject = mail.Subject,
            TextBody = mail.TextBody,
            HtmlBody = mail.HtmlBody,
        };
}
