using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string UnremindableMessage = "An diese Funktion lässt sich nicht erinnern.";
    private const string ClosedFunctionMessage = "Diese Funktion ist schon geschlossen.";
    private const string NobodyOpenMessage = "Alle haben schon geantwortet.";
    private const string RemindedRecentlyMessage =
        "Es wurde gerade erst erinnert. Erinnern geht wieder sechs Stunden danach.";

    public async Task<Result> RemindAsync(RemindCalendarCommand command, CancellationToken ct)
    {
        if (!CalendarReminderRules.Reminds(command.Kind))
            return Result.Validation(UnremindableMessage);

        var actorPersonId = await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct);
        var now = _timeProvider.GetUtcNow();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

        if (await LockedEntryAsync(command.CalendarEntryId, ct) is not { } entry)
            return Result.NotFound(UnknownEntryMessage);

        if (!await MayOwnAsync(command.ActorAccountId, entry.OwnerGroupId, ct))
            return Result.Forbidden(NotOwnedMessage);

        var targeted = ReminderTargetOf(entry, command);
        if (!targeted.IsSuccess)
            return Result.Carrying(targeted);

        var target = targeted.Value;
        if (target.IsClosedAt(now))
            return Result.Validation(ClosedFunctionMessage);

        if (!CalendarReminderRules.MayRemind(target.LastRemindedAt, now))
            return Result.Conflict(RemindedRecentlyMessage);

        if (!await HasOpenPeopleAsync(entry.Id, target, actorPersonId, ct))
            return Result.Validation(NobodyOpenMessage);

        StampReminder(entry, target, now);
        EnqueueReminder(entry, target, actorPersonId, await VenueNameAsync(entry.VenueId, ct));
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static Result<ReminderTarget> ReminderTargetOf(
        CalendarEntry entry,
        RemindCalendarCommand command
    ) =>
        command.Kind switch
        {
            CalendarEntryAddOnKind.Attendance => AttendanceTargetOf(entry),
            CalendarEntryAddOnKind.Poll => PollTargetOf(entry, command.AddOnId),
            _ => SignUpListTargetOf(entry, command.AddOnId),
        };

    [Pure]
    private static Result<ReminderTarget> AttendanceTargetOf(CalendarEntry entry) =>
        entry.AsksForResponse
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    CalendarEntryAddOnKind.Attendance,
                    entry.Id,
                    null,
                    null,
                    CalendarAddOnClosing.EntryEndOf(entry.StartsAt, entry.EndsAt),
                    entry.AttendanceLastRemindedAt
                )
            )
            : Result<ReminderTarget>.Validation(NoResponseWantedMessage);

    [Pure]
    private static Result<ReminderTarget> PollTargetOf(CalendarEntry entry, int? pollId) =>
        entry.Polls.SingleOrDefault(poll => poll.Id == pollId) is { } poll
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    CalendarEntryAddOnKind.Poll,
                    poll.Id,
                    poll.Question,
                    poll.ClosedAt,
                    CalendarAddOnClosing.ClosesAt(poll.VotesUntil, entry.StartsAt),
                    poll.LastRemindedAt
                )
            )
            : Result<ReminderTarget>.NotFound(UnknownPollMessage);

    [Pure]
    private static Result<ReminderTarget> SignUpListTargetOf(
        CalendarEntry entry,
        int? signUpListId
    ) =>
        entry.SignUpLists.SingleOrDefault(list => list.Id == signUpListId) is { } list
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    CalendarEntryAddOnKind.SignUpList,
                    list.Id,
                    list.Title,
                    list.ClosedAt,
                    CalendarAddOnClosing.ClosesAt(list.SignUpUntil, entry.StartsAt),
                    list.LastRemindedAt
                )
            )
            : Result<ReminderTarget>.NotFound(UnknownSignUpListMessage);

    private static void StampReminder(
        CalendarEntry entry,
        ReminderTarget target,
        DateTimeOffset now
    )
    {
        switch (target.Kind)
        {
            case CalendarEntryAddOnKind.Attendance:
                entry.AttendanceLastRemindedAt = now;
                break;
            case CalendarEntryAddOnKind.Poll:
                entry.Polls.Single(poll => poll.Id == target.AddOnId).LastRemindedAt = now;
                break;
            default:
                entry.SignUpLists.Single(list => list.Id == target.AddOnId).LastRemindedAt = now;
                break;
        }
    }

    private async Task<bool> HasOpenPeopleAsync(
        int calendarEntryId,
        ReminderTarget target,
        int? actorPersonId,
        CancellationToken ct
    )
    {
        var facts = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(row => row.Id == calendarEntryId)
            .Select(EntryFactsRows.Projection)
            .SingleAsync(ct);
        var concerned = await ConcernedIdsOfAsync(
            facts.ToFacts(),
            ClubClock.Today(_timeProvider),
            ct
        );
        var answered = await _dbContext.ReminderAnsweredIdsAsync(target.Kind, target.AddOnId, ct);

        return concerned.Any(personId => personId != actorPersonId && !answered.Contains(personId));
    }

    private void EnqueueReminder(
        CalendarEntry entry,
        ReminderTarget target,
        int? actorPersonId,
        string? venueName
    )
    {
        var push = PushOf(CalendarPushReason.Reminder, entry, [], actorPersonId, venueName);
        push.ReminderKind = target.Kind;
        push.ReminderAddOnId = target.AddOnId;
        push.ReminderSubject = target.Subject;
        push.ReminderClosesAt = target.ClosesAt;
        _dbContext.OutboxCalendarPushes.Add(push);
    }

    private sealed record ReminderTarget(
        CalendarEntryAddOnKind Kind,
        int AddOnId,
        string? Subject,
        DateTimeOffset? ClosedAt,
        DateTimeOffset ClosesAt,
        DateTimeOffset? LastRemindedAt
    )
    {
        [Pure]
        public bool IsClosedAt(DateTimeOffset now) => ClosedAt is not null || now >= ClosesAt;
    }
}
