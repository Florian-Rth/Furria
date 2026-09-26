using System.Diagnostics.Contracts;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class EmailConfirmationService
{
    private readonly AppDbContext _dbContext;
    private readonly MailQueue _mailQueue;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<EmailConfirmationService> _logger;

    public EmailConfirmationService(
        AppDbContext dbContext,
        MailQueue mailQueue,
        TimeProvider timeProvider,
        ILogger<EmailConfirmationService> logger
    )
    {
        _dbContext = dbContext;
        _mailQueue = mailQueue;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<DateTimeOffset> IssueAsync(EmailConfirmationIssue issue, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var code = ConfirmationCode.Generate(out var codeHash);
        var expiresAt = now + EmailConfirmation.Lifetime;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LiveOf(issue.Subject)
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.VoidedAt, now), ct);
        _dbContext.EmailConfirmations.Add(
            new EmailConfirmation
            {
                Purpose = issue.Subject.Purpose,
                InvitationId = issue.Subject.InvitationId,
                NormalizedEmail = issue.NormalizedEmail,
                CodeHash = codeHash,
                IssuedAt = now,
                ExpiresAt = expiresAt,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _mailQueue.Enqueue(EmailConfirmationMail.Compose(ToMailContent(issue, code)));
        _logger.LogInformation(
            "Email confirmation code issued for person {PersonId}",
            issue.PersonId
        );

        return expiresAt;
    }

    public async Task<EmailConfirmationVerdict> ConsumeAsync(
        EmailConfirmationAttempt attempt,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var live = await LiveOf(attempt.Subject)
            .AsNoTracking()
            .Select(row => new LiveConfirmationRow(
                row.Id,
                row.NormalizedEmail,
                row.CodeHash,
                row.ExpiresAt,
                row.FailedAttempts
            ))
            .SingleOrDefaultAsync(ct);

        if (live is null || !IsUsableFor(live, attempt.NormalizedEmail, now))
            return EmailConfirmationVerdict.Dead;

        if (!ConfirmationCode.Matches(attempt.Code, live.CodeHash))
            return await CountFailureAsync(live, ct);

        var consumed = await _dbContext
            .EmailConfirmations.Where(row =>
                row.Id == live.Id
                && row.ConsumedAt == null
                && row.VoidedAt == null
                && row.FailedAttempts < EmailConfirmation.MaxFailedAttempts
                && row.ExpiresAt > now
            )
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.ConsumedAt, now), ct);

        return consumed == 1 ? EmailConfirmationVerdict.Confirmed : EmailConfirmationVerdict.Dead;
    }

    private IQueryable<EmailConfirmation> LiveOf(EmailConfirmationSubject subject) =>
        _dbContext.EmailConfirmations.Where(row =>
            row.Purpose == subject.Purpose
            && row.InvitationId == subject.InvitationId
            && row.ConsumedAt == null
            && row.VoidedAt == null
        );

    private async Task<EmailConfirmationVerdict> CountFailureAsync(
        LiveConfirmationRow live,
        CancellationToken ct
    )
    {
        await _dbContext
            .EmailConfirmations.Where(row =>
                row.Id == live.Id && row.FailedAttempts < EmailConfirmation.MaxFailedAttempts
            )
            .ExecuteUpdateAsync(
                setters =>
                    setters.SetProperty(row => row.FailedAttempts, row => row.FailedAttempts + 1),
                ct
            );

        return live.FailedAttempts + 1 >= EmailConfirmation.MaxFailedAttempts
            ? EmailConfirmationVerdict.Dead
            : EmailConfirmationVerdict.Wrong;
    }

    [Pure]
    private static bool IsUsableFor(
        LiveConfirmationRow live,
        string normalizedEmail,
        DateTimeOffset now
    ) =>
        string.Equals(live.NormalizedEmail, normalizedEmail, StringComparison.Ordinal)
        && live.ExpiresAt > now
        && live.FailedAttempts < EmailConfirmation.MaxFailedAttempts;

    [Pure]
    private static EmailConfirmationMailContent ToMailContent(
        EmailConfirmationIssue issue,
        string code
    ) =>
        new()
        {
            PersonId = issue.PersonId,
            To = issue.Email,
            FirstName = issue.FirstName,
            ClubName = issue.ClubName,
            Code = code,
            Lifetime = EmailConfirmation.Lifetime,
        };

    private sealed record LiveConfirmationRow(
        long Id,
        string NormalizedEmail,
        string CodeHash,
        DateTimeOffset ExpiresAt,
        int FailedAttempts
    );
}
