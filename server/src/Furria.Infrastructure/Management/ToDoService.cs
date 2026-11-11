using System.Diagnostics.Contracts;
using Furria.Application.Management;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.GroupMatcher;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.MembershipApplications;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Management;

public sealed class ToDoService
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly InvitationRoundService _invitationRoundService;
    private readonly ClubRecordService _clubRecordService;
    private readonly GroupMatcherService _groupMatcherService;
    private readonly TimeProvider _timeProvider;

    public ToDoService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        InvitationRoundService invitationRoundService,
        ClubRecordService clubRecordService,
        GroupMatcherService groupMatcherService,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _invitationRoundService = invitationRoundService;
        _clubRecordService = clubRecordService;
        _groupMatcherService = groupMatcherService;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<ToDoSummary>> ForAsync(int accountId, CancellationToken ct)
    {
        var granted = (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(
            StringComparer.Ordinal
        );
        var today = ClubClock.Today(_timeProvider);
        var toDos = new List<ToDoSummary>();

        if (ToDoKeys.Shows(ToDoKind.NeverInvited, granted))
            toDos.AddRange(await InvitationToDosAsync(ct));

        if (ToDoKeys.Shows(ToDoKind.BirthDateUnknown, granted))
            toDos.Add(await BirthDatesUnknownAsync(today, ct));

        if (ToDoKeys.Shows(ToDoKind.KeyToTakeBack, granted))
            toDos.Add(await KeysToTakeBackAsync(today, ct));

        if (ToDoKeys.Shows(ToDoKind.ClubRecordGap, granted))
            toDos.Add(await ClubRecordGapsAsync(ct));

        if (ToDoKeys.Shows(ToDoKind.ApplicationWaiting, granted))
            toDos.Add(await WaitingApplicationsAsync(ct));

        if (ToDoKeys.Shows(ToDoKind.GroupMatcherStatementsOpen, granted))
            toDos.AddRange(await GroupMatcherStatementToDosAsync(accountId, ct));

        return
        [
            .. toDos
                .Where(toDo => toDo.Count > 0 && ToDoKeys.Shows(toDo.Kind, granted))
                .OrderBy(toDo => toDo.Kind),
        ];
    }

    [Pure]
    private static ToDoSummary ToDoOf(ToDoKind kind, int count) =>
        new() { Kind = kind, Count = count };

    private async Task<IReadOnlyList<ToDoSummary>> InvitationToDosAsync(CancellationToken ct)
    {
        var pending = await _invitationRoundService.PendingAsync(ct);

        return
        [
            ToDoOf(ToDoKind.NeverInvited, pending.InviteePersonIds.Count),
            ToDoOf(ToDoKind.ReminderDue, pending.ReminderInvitationIds.Count),
            ToDoOf(ToDoKind.InPersonOnly, pending.EligibleWithoutEmailPersonIds.Count),
        ];
    }

    private async Task<ToDoSummary> BirthDatesUnknownAsync(DateOnly today, CancellationToken ct) =>
        ToDoOf(ToDoKind.BirthDateUnknown, await _dbContext.BirthDateUnknown(today).CountAsync(ct));

    private async Task<ToDoSummary> KeysToTakeBackAsync(DateOnly today, CancellationToken ct)
    {
        var activePeople = _dbContext.People.Where(_dbContext.IsActiveInClubOn(today));

        return ToDoOf(
            ToDoKind.KeyToTakeBack,
            await _dbContext.KeyHoldings.CountAsync(
                holding =>
                    holding.UntilOn == null
                    && !activePeople.Any(person => person.Id == holding.PersonId),
                ct
            )
        );
    }

    private async Task<ToDoSummary> WaitingApplicationsAsync(CancellationToken ct) =>
        ToDoOf(
            ToDoKind.ApplicationWaiting,
            await _dbContext.UndecidedApplications().CountAsync(ct)
        );

    private async Task<ToDoSummary> ClubRecordGapsAsync(CancellationToken ct) =>
        ToDoOf(
            ToDoKind.ClubRecordGap,
            ClubRecordGaps.CountOf(await _clubRecordService.GetAsync(ct))
        );

    private async Task<IReadOnlyList<ToDoSummary>> GroupMatcherStatementToDosAsync(
        int accountId,
        CancellationToken ct
    )
    {
        var groupIds = await _authorizer.AdministeredGroupIdsAsync(accountId, ct);
        if (groupIds.Count == 0)
            return [];

        var attention = await _groupMatcherService.AttentionOfAsync(groupIds, ct);

        return
        [
            .. attention.Select(group =>
                ToDoOf(ToDoKind.GroupMatcherStatementsOpen, group.StatementCount) with
                {
                    Group = group.Group,
                }
            ),
        ];
    }
}
