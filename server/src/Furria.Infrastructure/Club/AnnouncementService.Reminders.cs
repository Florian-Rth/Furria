using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    private const string UnknownPollMessage = "Diese Umfrage gibt es nicht.";
    private const string UnknownSignUpListMessage = "Diese Eintragsliste gibt es nicht.";
    private const string ClosedFunctionMessage = "Diese Funktion ist schon geschlossen.";
    private const string NobodyOpenMessage = "Alle haben schon geantwortet.";
    private const string NobodyReachableMessage = "Von den Offenen hat niemand die App.";
    private const string RemindedRecentlyMessage =
        "Es wurde gerade erst erinnert. Erinnern geht wieder sechs Stunden danach.";

    public async Task<Result> RemindAsync(RemindAnnouncementCommand command, CancellationToken ct)
    {
        var actorPersonId = await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var announcement = await LockedAsync(command.AnnouncementId, ct);

        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !await _authorizer.MayManageAnnouncementAsync(
                command.ActorAccountId,
                announcement.AuthorPersonId,
                ct
            )
        )
            return Result.Forbidden(NotManagedMessage);

        var targeted = ReminderTargetOf(announcement, command);
        if (!targeted.IsSuccess)
            return Result.Carrying(targeted);

        var target = targeted.Value;
        var now = _timeProvider.GetUtcNow();
        if (target.IsClosedAt(now))
            return Result.Validation(ClosedFunctionMessage);

        if (!CalendarReminderRules.MayRemind(target.LastRemindedAt, now))
            return Result.Conflict(RemindedRecentlyMessage);

        var open = await OpenPeopleOfAsync(target, actorPersonId, ct);
        if (open.Count == 0)
            return Result.Validation(NobodyOpenMessage);

        var accountIds = await _dbContext
            .PushableAccounts()
            .Where(account => open.Contains(account.PersonId!.Value))
            .OrderBy(account => account.Id)
            .Select(account => account.Id)
            .ToListAsync(ct);
        if (accountIds.Count == 0)
            return Result.Validation(NobodyReachableMessage);

        StampReminder(announcement, target, now);
        _dbContext.OutboxPushes.AddRange(
            accountIds.Select(accountId =>
                AnnouncementPushMessages.ReminderFor(
                    announcement,
                    new AnnouncementReminder(target.Kind, target.AddOnId, target.Subject),
                    accountId,
                    now + AnnouncementPushRules.ReminderTimeToLive(target.ClosesAt, now)
                )
            )
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static Result<ReminderTarget> ReminderTargetOf(
        Announcement announcement,
        RemindAnnouncementCommand command
    )
    {
        var hostClosesAt = AnnouncementAddOns.ClosesAt(announcement.ValidUntil);

        return command.Kind switch
        {
            AnnouncementAddOnKind.Attendance => AttendanceTargetOf(announcement, hostClosesAt),
            AnnouncementAddOnKind.Poll => PollTargetOf(
                announcement.Polls.SingleOrDefault(poll => poll.Id == command.AddOnId),
                hostClosesAt
            ),
            _ => SignUpListTargetOf(
                announcement.SignUpLists.SingleOrDefault(list => list.Id == command.AddOnId),
                hostClosesAt
            ),
        };
    }

    [Pure]
    private static Result<ReminderTarget> AttendanceTargetOf(
        Announcement announcement,
        DateTimeOffset? hostClosesAt
    ) =>
        announcement.AttendancePosition is not null
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    AnnouncementAddOnKind.Attendance,
                    announcement.Id,
                    null,
                    announcement.AttendanceClosedAt,
                    AddOnClosing.ClosesAt(announcement.AnswersUntil, hostClosesAt),
                    announcement.AttendanceLastRemindedAt
                )
            )
            : Result<ReminderTarget>.Validation(NoResponseWantedMessage);

    [Pure]
    private static Result<ReminderTarget> PollTargetOf(Poll? poll, DateTimeOffset? hostClosesAt) =>
        poll is not null
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    AnnouncementAddOnKind.Poll,
                    poll.Id,
                    poll.Question,
                    poll.ClosedAt,
                    AddOnClosing.ClosesAt(poll.VotesUntil, hostClosesAt),
                    poll.LastRemindedAt
                )
            )
            : Result<ReminderTarget>.NotFound(UnknownPollMessage);

    [Pure]
    private static Result<ReminderTarget> SignUpListTargetOf(
        SignUpList? list,
        DateTimeOffset? hostClosesAt
    ) =>
        list is not null
            ? Result<ReminderTarget>.Success(
                new ReminderTarget(
                    AnnouncementAddOnKind.SignUpList,
                    list.Id,
                    list.Title,
                    list.ClosedAt,
                    AddOnClosing.ClosesAt(list.SignUpUntil, hostClosesAt),
                    list.LastRemindedAt
                )
            )
            : Result<ReminderTarget>.NotFound(UnknownSignUpListMessage);

    private static void StampReminder(
        Announcement announcement,
        ReminderTarget target,
        DateTimeOffset now
    )
    {
        switch (target.Kind)
        {
            case AnnouncementAddOnKind.Attendance:
                announcement.AttendanceLastRemindedAt = now;
                break;
            case AnnouncementAddOnKind.Poll:
                announcement.Polls.Single(poll => poll.Id == target.AddOnId).LastRemindedAt = now;
                break;
            default:
                announcement.SignUpLists.Single(list => list.Id == target.AddOnId).LastRemindedAt =
                    now;
                break;
        }
    }

    private async Task<IReadOnlySet<int>> OpenPeopleOfAsync(
        ReminderTarget target,
        int? actorPersonId,
        CancellationToken ct
    )
    {
        var concerned = await _dbContext.AnnouncementConcernedIdsAsync(
            ClubClock.Today(_timeProvider),
            ct
        );
        var answered = await AnsweredIdsOfAsync(target, ct);

        return concerned
            .Where(personId => personId != actorPersonId && !answered.Contains(personId))
            .ToHashSet();
    }

    private async Task<IReadOnlySet<int>> AnsweredIdsOfAsync(
        ReminderTarget target,
        CancellationToken ct
    )
    {
        var answered = target.Kind switch
        {
            AnnouncementAddOnKind.Attendance => _dbContext
                .AttendanceResponses.Where(response => response.AnnouncementId == target.AddOnId)
                .Select(response => response.PersonId),
            AnnouncementAddOnKind.Poll => _dbContext
                .PollVotes.Where(vote => vote.PollId == target.AddOnId)
                .Select(vote => vote.PersonId),
            _ => _dbContext
                .SignUpLines.Where(line => line.SignUpListId == target.AddOnId)
                .Select(line => line.PersonId),
        };

        return (await answered.Distinct().ToListAsync(ct)).ToHashSet();
    }

    private sealed record ReminderTarget(
        AnnouncementAddOnKind Kind,
        int AddOnId,
        string? Subject,
        DateTimeOffset? ClosedAt,
        DateTimeOffset? ClosesAt,
        DateTimeOffset? LastRemindedAt
    )
    {
        [Pure]
        public bool IsClosedAt(DateTimeOffset now) => ClosedAt is not null || ClosesAt <= now;
    }
}
