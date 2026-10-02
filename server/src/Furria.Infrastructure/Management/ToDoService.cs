using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Identity;
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
        var granted = (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(
            StringComparer.Ordinal
        );
        var today = ClubClock.Today(_timeProvider);
        var toDos = new List<ToDoSummary>();

        if (granted.Contains(FurriaPermissions.PersonsManage))
            toDos.AddRange(await InvitationWorkAsync(ct));

        if (
            granted.Contains(FurriaPermissions.PersonsManage)
            && granted.Contains(FurriaPermissions.AccountsManage)
        )
            toDos.Add(await BirthDatesUnknownAsync(today, ct));

        if (granted.Contains(FurriaPermissions.KeyHoldingsManage))
            toDos.Add(await KeysToTakeBackAsync(today, ct));

        if (granted.Contains(FurriaPermissions.ClubManage))
            toDos.Add(await ClubRecordGapsAsync(ct));

        return [.. toDos.Where(toDo => toDo.Count > 0)];
    }

    [Pure]
    private static ToDoSummary ToDoOf(ToDoKind kind, int count) =>
        new() { Kind = kind, Count = count };

    private async Task<IReadOnlyList<ToDoSummary>> InvitationWorkAsync(CancellationToken ct)
    {
        var preview = await _invitationRoundService.PreviewAsync(ct);

        return
        [
            ToDoOf(ToDoKind.NeverInvited, preview.InviteCount),
            ToDoOf(ToDoKind.ReminderDue, preview.RemindCount),
            ToDoOf(ToDoKind.InPersonOnly, preview.EligibleWithoutEmailCount),
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
                    holding.SinceOn <= today
                    && (holding.UntilOn == null || holding.UntilOn >= today)
                    && !activePeople.Any(person => person.Id == holding.PersonId),
                ct
            )
        );
    }

    private async Task<ToDoSummary> ClubRecordGapsAsync(CancellationToken ct) =>
        ToDoOf(
            ToDoKind.ClubRecordGap,
            ClubRecordGaps.CountOf(await _clubRecordService.GetAsync(ct))
        );
}
