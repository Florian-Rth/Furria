using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Club;

public sealed class CalendarPushExpansion
{
    private static readonly IReadOnlySet<int> NobodyAnswered = new HashSet<int>();

    private readonly AppDbContext _dbContext;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<CalendarPushExpansion> _logger;

    public CalendarPushExpansion(
        AppDbContext dbContext,
        IServiceScopeFactory scopeFactory,
        TimeProvider timeProvider,
        ILogger<CalendarPushExpansion> logger
    )
    {
        _dbContext = dbContext;
        _scopeFactory = scopeFactory;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<bool> ExpandNextAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var push = await ClaimDueAsync(now, ct);
        if (push is null)
            return false;

        try
        {
            var outgoing = await OutgoingPushesAsync(push, now, ct);
            _dbContext.OutboxPushes.AddRange(outgoing);
            _dbContext.OutboxCalendarPushes.Remove(push);
            await _dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            _logger.LogInformation(
                "Calendar push {CalendarPushReason} for entry {CalendarEntryId} queued for {RecipientAccounts} accounts",
                push.Reason,
                push.CalendarEntryId,
                outgoing.Count
            );
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            await transaction.RollbackAsync(ct);
            await RetryOrAbandonAsync(push, exception, now, ct);
        }

        return true;
    }

    [Pure]
    private static CalendarEntryFacts FactsOf(OutboxCalendarPush push) =>
        new()
        {
            OwnerGroupId = push.OwnerGroupId,
            ParticipatingGroupIds = push.ParticipatingGroupIds,
            Audience = push.Audience,
            AudienceGroupIds = push.AudienceGroupIds,
            AudiencePersonIds = push.AudiencePersonIds,
            Kind = push.Kind,
            AsksForResponse = push.AsksForResponse,
            StartsAt = push.StartsAt,
        };

    private Task<OutboxCalendarPush?> ClaimDueAsync(DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .OutboxCalendarPushes.FromSql(
                $"""
                SELECT * FROM outbox_calendar_push
                WHERE next_attempt_at IS NULL OR next_attempt_at <= {now}
                ORDER BY id
                LIMIT 1
                FOR UPDATE SKIP LOCKED
                """
            )
            .SingleOrDefaultAsync(ct);

    private async Task<List<OutboxPush>> OutgoingPushesAsync(
        OutboxCalendarPush push,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (!IsDue(push, now))
            return [];

        if (push.Reason != CalendarPushReason.Deleted && !await EntryExistsAsync(push, ct))
            return [];

        var entry = FactsOf(push);
        var today = ClubClock.DayOf(now);
        var outgoing = new List<OutboxPush>();

        var answered = await AnsweredBeforeReminderAsync(push, ct);
        if (answered is null)
            return [];

        var recipients = (await CandidateAccountsAsync(push, ct))
            .Where(recipient => !answered.Contains(recipient.PersonId))
            .ToList();
        var tiesByPerson = await _dbContext.CalendarTiesOfManyAsync(
            [.. recipients.Select(recipient => recipient.PersonId)],
            today,
            ct
        );

        foreach (var recipient in recipients)
        {
            var ties = tiesByPerson[recipient.PersonId];
            if (
                CalendarPushRules.MayConcern(push.Reason, entry, ties)
                && CalendarPushRules.Reaches(
                    push.Reason,
                    entry,
                    ties,
                    await RightsOfAsync(recipient.AccountId, ct)
                )
            )
                outgoing.Add(CalendarPushMessages.For(push, recipient.AccountId, now));
        }

        return outgoing;
    }

    [Pure]
    private static bool IsDue(OutboxCalendarPush push, DateTimeOffset now) =>
        push.Reason == CalendarPushReason.Reminder
            ? push.ReminderClosesAt is { } closesAt
                && CalendarPushRules.IsReminderDue(closesAt, now)
            : CalendarPushRules.IsDue(push.Reason, push.StartsAt, push.EndsAt, now);

    private async Task<IReadOnlySet<int>?> AnsweredBeforeReminderAsync(
        OutboxCalendarPush push,
        CancellationToken ct
    ) =>
        push.Reason != CalendarPushReason.Reminder ? NobodyAnswered
        : push.ReminderKind is { } kind && push.ReminderAddOnId is { } addOnId
            ? await _dbContext.OpenReminderAnsweredIdsAsync(kind, addOnId, ct)
        : null;

    private Task<bool> EntryExistsAsync(OutboxCalendarPush push, CancellationToken ct) =>
        _dbContext.CalendarEntries.AnyAsync(entry => entry.Id == push.CalendarEntryId, ct);

    private Task<List<RecipientAccount>> CandidateAccountsAsync(
        OutboxCalendarPush push,
        CancellationToken ct
    )
    {
        var accounts = _dbContext.PushableAccounts(CalendarPushRules.TopicOf(push.Reason));

        if (push.ActorPersonId is { } actorPersonId)
            accounts = accounts.Where(account => account.PersonId != actorPersonId);

        if (!CalendarPushRules.ReachesEveryoneConcerned(push.Reason))
        {
            var personIds = push.PersonIds;
            accounts = accounts.Where(account => personIds.Contains(account.PersonId!.Value));
        }

        return accounts
            .OrderBy(account => account.Id)
            .Select(account => new RecipientAccount(account.Id, account.PersonId!.Value))
            .ToListAsync(ct);
    }

    private async Task<CalendarRights> RightsOfAsync(int accountId, CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var authorizer = scope.ServiceProvider.GetRequiredService<PermissionAuthorizer>();

        return new CalendarRights(
            HoldsClubRead: await authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.ClubRead,
                ct
            ),
            ManagesClubCalendar: await authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.CalendarManageClub,
                ct
            )
        );
    }

    private async Task RetryOrAbandonAsync(
        OutboxCalendarPush push,
        Exception exception,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.ChangeTracker.Clear();
        var claimed = _dbContext.OutboxCalendarPushes.Where(row => row.Id == push.Id);

        if (PushRetrySchedule.DelayAfterFailed(push.Attempt) is not { } delay)
        {
            _logger.LogWarning(
                exception,
                "Calendar push {CalendarPushId} abandoned after {AttemptCount} attempts",
                push.Id,
                push.Attempt
            );
            await claimed.ExecuteDeleteAsync(ct);
            return;
        }

        _logger.LogWarning(
            exception,
            "Calendar push {CalendarPushId} failed on attempt {AttemptNumber}, retrying in {RetryDelay}",
            push.Id,
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

    private sealed record RecipientAccount(int AccountId, int PersonId);
}
