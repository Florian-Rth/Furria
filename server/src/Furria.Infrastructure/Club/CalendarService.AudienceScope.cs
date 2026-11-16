using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Ties;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private static readonly AudienceChoice NoHeldAudience = new(
        CalendarEntryAudience.Groups,
        [],
        []
    );

    private async Task<bool> MayAddressAsync(
        int actorAccountId,
        AudienceChoice wanted,
        AudienceChoice held,
        CancellationToken ct
    )
    {
        if (
            await _authorizer.IsGrantedAsync(
                actorAccountId,
                FurriaPermissions.CalendarManageClub,
                ct
            )
        )
            return true;

        var added = AddedTo(held, wanted);
        if (added.Audience == CalendarEntryAudience.Club)
            return false;

        if (added.GroupIds.Count == 0 && added.PersonIds.Count == 0)
            return true;

        var reachableGroupIds = await ReachableGroupIdsAsync(actorAccountId, ct);

        return added.GroupIds.All(reachableGroupIds.Contains)
            && await AreMembersOfAsync(added.PersonIds, reachableGroupIds, ct);
    }

    [Pure]
    private static AudienceChoice HeldAudienceOf(CalendarEntry entry) =>
        new(
            entry.Audience,
            [.. entry.AudienceGroups.Select(link => link.GroupId)],
            [.. entry.AudiencePeople.Select(link => link.PersonId)]
        );

    [Pure]
    private static AudienceChoice AddedTo(AudienceChoice held, AudienceChoice wanted) =>
        new(
            wanted.Audience == CalendarEntryAudience.Club
            && held.Audience != CalendarEntryAudience.Club
                ? CalendarEntryAudience.Club
                : CalendarEntryAudience.Groups,
            [.. wanted.GroupIds.Except(held.GroupIds)],
            [.. wanted.PersonIds.Except(held.PersonIds)]
        );

    private async Task<IReadOnlyList<int>> ReachableGroupIdsAsync(
        int actorAccountId,
        CancellationToken ct
    ) =>
        await _authorizer.IsGrantedAsync(actorAccountId, FurriaPermissions.GroupsManage, ct)
            ? await _dbContext.Groups.AsNoTracking().Select(group => group.Id).ToListAsync(ct)
            : await _authorizer.AdministeredGroupIdsAsync(actorAccountId, ct);

    private async Task<bool> AreMembersOfAsync(
        IReadOnlyList<int> personIds,
        IReadOnlyList<int> groupIds,
        CancellationToken ct
    )
    {
        if (personIds.Count == 0)
            return true;

        var memberCount = await _dbContext
            .GroupMemberships.AsNoTracking()
            .Where(Conferring.GroupMemberships(ClubClock.Today(_timeProvider)))
            .Where(membership =>
                groupIds.Contains(membership.GroupId) && personIds.Contains(membership.PersonId)
            )
            .Select(membership => membership.PersonId)
            .Distinct()
            .CountAsync(ct);

        return memberCount == personIds.Count;
    }
}
