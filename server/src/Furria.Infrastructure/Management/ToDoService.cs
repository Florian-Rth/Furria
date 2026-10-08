using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.MembershipApplications;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Management;

public sealed class ToDoService
{
    private const string NothingToDoMessage = "Hier ist gerade nichts zu erledigen.";
    private const string ChangedMeanwhileMessage =
        "Inzwischen hat sich hier etwas geändert. Bitte neu laden.";

    private static readonly IReadOnlySet<string> NothingSeen = FrozenSet<string>.Empty;

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly InvitationRoundService _invitationRoundService;
    private readonly ClubRecordService _clubRecordService;
    private readonly TimeProvider _timeProvider;

    public ToDoService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        InvitationRoundService invitationRoundService,
        ClubRecordService clubRecordService,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _invitationRoundService = invitationRoundService;
        _clubRecordService = clubRecordService;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<ToDoSummary>> ForAsync(int accountId, CancellationToken ct)
    {
        var work = await WorkOfAsync(accountId, ct);
        var seen = await SeenSubjectsOfAsync(accountId, ct);

        return
        [
            .. work.Select(item =>
                ToDoSubjects.SummaryOf(
                    item.Kind,
                    item.Subjects,
                    seen.GetValueOrDefault(item.Kind, NothingSeen)
                )
            ),
        ];
    }

    public async Task<Result> MarkSeenAsync(ToDoMarkCommand command, CancellationToken ct)
    {
        var work = (await WorkOfAsync(command.AccountId, ct)).SingleOrDefault(item =>
            item.Kind == command.Kind
        );

        if (work is null)
            return Result.NotFound(NothingToDoMessage);

        if (!IsShown(work, command.Version))
            return Result.Conflict(ChangedMeanwhileMessage);

        var mark = await MarkOfAsync(command.AccountId, command.Kind, ct);
        mark.SeenSubjects = [.. work.Subjects];
        mark.SeenAt = _timeProvider.GetUtcNow();

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task UnmarkSeenAsync(int accountId, ToDoKind kind, CancellationToken ct) =>
        await _dbContext
            .ToDoMarks.Where(mark => mark.AccountId == accountId && mark.Kind == kind)
            .ExecuteDeleteAsync(ct);

    [Pure]
    private static bool IsShown(ToDoWork work, string version) =>
        string.Equals(ToDoSubjects.VersionOf(work.Subjects), version, StringComparison.Ordinal);

    [Pure]
    private static ToDoWork WorkOf(ToDoKind kind, IEnumerable<int> ids) =>
        new(kind, [.. ids.Select(id => id.ToString(CultureInfo.InvariantCulture))]);

    private async Task<IReadOnlyList<ToDoWork>> WorkOfAsync(int accountId, CancellationToken ct)
    {
        var granted = (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(
            StringComparer.Ordinal
        );
        var today = ClubClock.Today(_timeProvider);
        var work = new List<ToDoWork>();

        if (granted.Contains(FurriaPermissions.PersonsManage))
            work.AddRange(await InvitationWorkAsync(ct));

        if (
            granted.Contains(FurriaPermissions.PersonsManage)
            && granted.Contains(FurriaPermissions.AccountsManage)
        )
            work.Add(await BirthDatesUnknownAsync(today, ct));

        if (granted.Contains(FurriaPermissions.KeyHoldingsManage))
            work.Add(await KeysToTakeBackAsync(today, ct));

        if (granted.Contains(FurriaPermissions.ClubManage))
            work.Add(await ClubRecordGapsAsync(ct));

        if (granted.Contains(FurriaPermissions.MembershipApplicationsDecide))
            work.Add(await WaitingApplicationsAsync(ct));

        if (granted.Contains(FurriaPermissions.TicketRequestsHandle))
            work.Add(await WaitingTicketRequestsAsync(ct));

        return [.. work.Where(item => item.Subjects.Count > 0).OrderBy(item => item.Kind)];
    }

    private async Task<IReadOnlyDictionary<ToDoKind, IReadOnlySet<string>>> SeenSubjectsOfAsync(
        int accountId,
        CancellationToken ct
    )
    {
        var marks = await _dbContext
            .ToDoMarks.AsNoTracking()
            .Where(mark => mark.AccountId == accountId)
            .Select(mark => new { mark.Kind, mark.SeenSubjects })
            .ToListAsync(ct);

        return marks.ToDictionary(
            mark => mark.Kind,
            IReadOnlySet<string> (mark) => mark.SeenSubjects.ToFrozenSet(StringComparer.Ordinal)
        );
    }

    private async Task<ToDoMark> MarkOfAsync(int accountId, ToDoKind kind, CancellationToken ct)
    {
        var mark = await _dbContext.ToDoMarks.SingleOrDefaultAsync(
            row => row.AccountId == accountId && row.Kind == kind,
            ct
        );

        if (mark is not null)
            return mark;

        var unmarked = new ToDoMark { AccountId = accountId, Kind = kind };
        _dbContext.ToDoMarks.Add(unmarked);

        return unmarked;
    }

    private async Task<IReadOnlyList<ToDoWork>> InvitationWorkAsync(CancellationToken ct)
    {
        var pending = await _invitationRoundService.PendingAsync(ct);

        return
        [
            WorkOf(ToDoKind.NeverInvited, pending.InviteePersonIds),
            WorkOf(ToDoKind.ReminderDue, pending.ReminderInvitationIds),
            WorkOf(ToDoKind.InPersonOnly, pending.EligibleWithoutEmailPersonIds),
        ];
    }

    private async Task<ToDoWork> BirthDatesUnknownAsync(DateOnly today, CancellationToken ct) =>
        WorkOf(
            ToDoKind.BirthDateUnknown,
            await _dbContext.BirthDateUnknown(today).Select(person => person.Id).ToListAsync(ct)
        );

    private async Task<ToDoWork> KeysToTakeBackAsync(DateOnly today, CancellationToken ct)
    {
        var activePeople = _dbContext.People.Where(_dbContext.IsActiveInClubOn(today));

        return WorkOf(
            ToDoKind.KeyToTakeBack,
            await _dbContext
                .KeyHoldings.Where(holding =>
                    holding.UntilOn == null
                    && !activePeople.Any(person => person.Id == holding.PersonId)
                )
                .Select(holding => holding.Id)
                .ToListAsync(ct)
        );
    }

    private async Task<ToDoWork> WaitingApplicationsAsync(CancellationToken ct) =>
        WorkOf(
            ToDoKind.ApplicationWaiting,
            await _dbContext
                .UndecidedApplications()
                .Select(application => application.Id)
                .ToListAsync(ct)
        );

    private async Task<ToDoWork> WaitingTicketRequestsAsync(CancellationToken ct) =>
        WorkOf(
            ToDoKind.TicketRequestWaiting,
            await _dbContext.TicketRequests.Select(request => request.Id).ToListAsync(ct)
        );

    private async Task<ToDoWork> ClubRecordGapsAsync(CancellationToken ct) =>
        new(
            ToDoKind.ClubRecordGap,
            ClubRecordGaps.MissingOf(await _clubRecordService.GetAsync(ct))
        );

    private sealed record ToDoWork(ToDoKind Kind, IReadOnlyList<string> Subjects);
}
