using System.Diagnostics.Contracts;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Mail;

public sealed class MailDispatcher : BackgroundService
{
    private static readonly IReadOnlyList<TimeSpan> RetryDelays =
    [
        TimeSpan.FromSeconds(5),
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
    ];

    private readonly MailQueue _queue;
    private readonly MailService _mailService;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<MailDispatcher> _logger;

    public MailDispatcher(
        MailQueue queue,
        MailService mailService,
        TimeProvider timeProvider,
        ILogger<MailDispatcher> logger
    )
    {
        _queue = queue;
        _mailService = mailService;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var mail in _queue.ReadAllAsync(stoppingToken))
            await DispatchAsync(mail, stoppingToken);
    }

    private async Task DispatchAsync(OutgoingMail mail, CancellationToken ct)
    {
        try
        {
            await _mailService.SendAsync(mail, ct);
            _logger.LogInformation(
                "Mail {MailTemplate} sent to person {PersonId}",
                mail.Template,
                mail.PersonId
            );
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            ScheduleRetry(mail, exception.GetType().Name, ct);
        }
    }

    private void ScheduleRetry(OutgoingMail mail, string failureType, CancellationToken ct)
    {
        if (RetryDelayAfter(mail.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                "Mail {MailTemplate} to person {PersonId} abandoned after {AttemptCount} attempts, last failure {FailureType}",
                mail.Template,
                mail.PersonId,
                mail.Attempt,
                failureType
            );
            return;
        }

        _logger.LogWarning(
            "Mail {MailTemplate} to person {PersonId} failed on attempt {AttemptNumber} with {FailureType}, retrying in {RetryDelay}",
            mail.Template,
            mail.PersonId,
            mail.Attempt,
            failureType,
            delay
        );
        _ = RequeueLaterAsync(mail with { Attempt = mail.Attempt + 1 }, delay, ct);
    }

    private async Task RequeueLaterAsync(OutgoingMail mail, TimeSpan delay, CancellationToken ct)
    {
        try
        {
            await Task.Delay(delay, _timeProvider, ct);
            _queue.Enqueue(mail);
        }
        catch (OperationCanceledException) { }
    }

    [Pure]
    private static TimeSpan? RetryDelayAfter(int attempt) =>
        attempt <= RetryDelays.Count ? RetryDelays[attempt - 1] : null;
}
