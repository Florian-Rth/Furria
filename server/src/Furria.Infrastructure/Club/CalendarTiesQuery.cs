using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.RunningOrders;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public static class CalendarTiesQuery
{
    public static async Task<CalendarTies> CalendarTiesOfAsync(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today,
        CancellationToken ct
    )
    {
        var runningMembershipPauses = await dbContext
            .Memberships.AsNoTracking()
            .Where(Running.Memberships(today))
            .Where(membership => membership.PersonId == personId)
            .Select(membership =>
                membership
                    .Pauses.Select(pause => new PauseRow(
                        pause.FirstSessionYear,
                        pause.LastSessionYear
                    ))
                    .ToList()
            )
            .ToListAsync(ct);

        var memberGroupIds = await dbContext
            .RunningGroupMemberships(personId, today)
            .AsNoTracking()
            .Select(membership => membership.GroupId)
            .ToListAsync(ct);

        var adminTenures = await dbContext
            .RunningGroupAdminTenures(personId, today)
            .AsNoTracking()
            .OrderBy(admin => admin.SinceOn)
            .ThenBy(admin => admin.Id)
            .Select(admin => new AdminTenureRow(admin.GroupId, admin.Function))
            .ToListAsync(ct);

        return new CalendarTies
        {
            HoldsRunningMembership = runningMembershipPauses.Count > 0,
            Pauses = [.. runningMembershipPauses.SelectMany(pauses => pauses).Select(ToSpan)],
            MemberGroupIds = memberGroupIds.ToHashSet(),
            AdminFunctions = ToAdminFunctions(adminTenures),
            CastSessions = await CastSessionsOfAsync(dbContext, personId, today, ct),
        };
    }

    [Pure]
    public static IQueryable<int> TiedGroupIds(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    ) =>
        dbContext
            .RunningGroupMemberships(personId, today)
            .Select(membership => membership.GroupId)
            .Concat(
                dbContext.RunningGroupAdminTenures(personId, today).Select(admin => admin.GroupId)
            );

    [Pure]
    public static IQueryable<int> CastGroupIds(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    ) => dbContext.CastActs(personId, today).Select(act => act.GroupId!.Value);

    [Pure]
    private static IQueryable<Act> CastActs(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    )
    {
        var memberGroupIds = dbContext
            .RunningGroupMemberships(personId, today)
            .Select(membership => membership.GroupId);

        return dbContext
            .Acts.Where(act =>
                act.ArchivedAt == null && act.SessionYear != null && act.GroupId != null
            )
            .Where(act =>
                act.CastFrozenAt != null
                    ? act.FrozenCast.Any(member => member.PersonId == personId)
                    : act.CastChanges.Any(change =>
                        change.PersonId == personId && change.Change == CastChange.Added
                    )
                        || (
                            memberGroupIds.Contains(act.GroupId!.Value)
                            && !act.CastChanges.Any(change =>
                                change.PersonId == personId && change.Change == CastChange.Removed
                            )
                        )
            );
    }

    private static async Task<IReadOnlySet<GroupSession>> CastSessionsOfAsync(
        AppDbContext dbContext,
        int? personId,
        DateOnly today,
        CancellationToken ct
    )
    {
        if (personId is null)
            return new HashSet<GroupSession>();

        var rows = await dbContext
            .CastActs(personId, today)
            .AsNoTracking()
            .Select(act => new
            {
                GroupId = act.GroupId!.Value,
                SessionYear = act.SessionYear!.Value,
            })
            .Distinct()
            .ToListAsync(ct);

        return rows.Select(row => new GroupSession(row.GroupId, row.SessionYear)).ToHashSet();
    }

    [Pure]
    private static IQueryable<GroupMembership> RunningGroupMemberships(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    ) =>
        dbContext
            .GroupMemberships.Where(Conferring.GroupMemberships(today))
            .Where(membership => membership.PersonId == personId);

    [Pure]
    private static IQueryable<GroupAdmin> RunningGroupAdminTenures(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    ) =>
        dbContext
            .GroupAdmins.Where(Conferring.GroupAdmins(today))
            .Where(admin => admin.PersonId == personId);

    [Pure]
    private static SessionSpan ToSpan(PauseRow pause) =>
        new() { FirstYear = pause.FirstSessionYear, LastYear = pause.LastSessionYear };

    [Pure]
    private static IReadOnlyDictionary<int, string?> ToAdminFunctions(
        IReadOnlyList<AdminTenureRow> tenures
    ) =>
        tenures
            .GroupBy(tenure => tenure.GroupId)
            .ToDictionary(held => held.Key, held => held.First().Function);

    private sealed record PauseRow(int FirstSessionYear, int? LastSessionYear);

    private sealed record AdminTenureRow(int GroupId, string? Function);
}
