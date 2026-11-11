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
        if (personId is not { } id)
            return UntiedOf(null);

        var ties = await dbContext.CalendarTiesOfManyAsync([id], today, ct);

        return ties[id];
    }

    public static async Task<IReadOnlyDictionary<int, CalendarTies>> CalendarTiesOfManyAsync(
        this AppDbContext dbContext,
        IReadOnlyCollection<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var ids = personIds.Distinct().ToList();
        if (ids.Count == 0)
            return new Dictionary<int, CalendarTies>();

        var memberships = await dbContext
            .Memberships.AsNoTracking()
            .Where(Running.Memberships(today))
            .Where(membership => ids.Contains(membership.PersonId))
            .Select(membership => new MembershipRow(
                membership.PersonId,
                membership
                    .Pauses.Select(pause => new PauseRow(
                        pause.FirstSessionYear,
                        pause.LastSessionYear
                    ))
                    .ToList()
            ))
            .ToListAsync(ct);

        var groupMemberships = await dbContext
            .GroupMemberships.AsNoTracking()
            .Where(Conferring.GroupMemberships(today))
            .Where(membership => ids.Contains(membership.PersonId))
            .Select(membership => new PersonGroupRow(membership.PersonId, membership.GroupId))
            .ToListAsync(ct);

        var adminTenures = await dbContext
            .GroupAdmins.AsNoTracking()
            .Where(Conferring.GroupAdmins(today))
            .Where(admin => ids.Contains(admin.PersonId))
            .OrderBy(admin => admin.SinceOn)
            .ThenBy(admin => admin.Id)
            .Select(admin => new AdminTenureRow(admin.PersonId, admin.GroupId, admin.Function))
            .ToListAsync(ct);

        var castSessions = await CastSessionsOfManyAsync(dbContext, ids, today, ct);
        var membershipsByPerson = memberships.ToLookup(row => row.PersonId);
        var groupsByPerson = groupMemberships.ToLookup(row => row.PersonId, row => row.GroupId);
        var tenuresByPerson = adminTenures.ToLookup(row => row.PersonId);
        var castByPerson = castSessions.ToLookup(
            row => row.PersonId,
            row => new GroupSession(row.GroupId, row.SessionYear)
        );

        return ids.ToDictionary(
            id => id,
            id => new CalendarTies
            {
                PersonId = id,
                HoldsRunningMembership = membershipsByPerson.Contains(id),
                Pauses = [.. membershipsByPerson[id].SelectMany(row => row.Pauses).Select(ToSpan)],
                MemberGroupIds = groupsByPerson[id].ToHashSet(),
                AdminFunctions = ToAdminFunctions([.. tenuresByPerson[id]]),
                CastSessions = castByPerson[id].ToHashSet(),
            }
        );
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
    public static IQueryable<int> AdministeredGroupIds(
        this AppDbContext dbContext,
        int? personId,
        DateOnly today
    ) => dbContext.RunningGroupAdminTenures(personId, today).Select(admin => admin.GroupId);

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

    private static async Task<List<CastSessionRow>> CastSessionsOfManyAsync(
        AppDbContext dbContext,
        IReadOnlyList<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var acts = dbContext.Acts.Where(act =>
            act.ArchivedAt == null && act.SessionYear != null && act.GroupId != null
        );

        var frozen = acts.Where(act => act.CastFrozenAt != null)
            .SelectMany(
                act => act.FrozenCast.Where(member => personIds.Contains(member.PersonId)),
                (act, member) =>
                    new CastSessionRow(member.PersonId, act.GroupId!.Value, act.SessionYear!.Value)
            );

        var added = acts.Where(act => act.CastFrozenAt == null)
            .SelectMany(
                act =>
                    act.CastChanges.Where(change =>
                        change.Change == CastChange.Added && personIds.Contains(change.PersonId)
                    ),
                (act, change) =>
                    new CastSessionRow(change.PersonId, act.GroupId!.Value, act.SessionYear!.Value)
            );

        var members = acts.Where(act => act.CastFrozenAt == null)
            .SelectMany(
                act =>
                    dbContext
                        .GroupMemberships.Where(Conferring.GroupMemberships(today))
                        .Where(membership =>
                            membership.GroupId == act.GroupId
                            && personIds.Contains(membership.PersonId)
                            && !act.CastChanges.Any(change =>
                                change.PersonId == membership.PersonId
                                && change.Change == CastChange.Removed
                            )
                        ),
                (act, membership) =>
                    new CastSessionRow(
                        membership.PersonId,
                        act.GroupId!.Value,
                        act.SessionYear!.Value
                    )
            );

        var rows = await frozen.AsNoTracking().ToListAsync(ct);
        rows.AddRange(await added.AsNoTracking().ToListAsync(ct));
        rows.AddRange(await members.AsNoTracking().ToListAsync(ct));

        return [.. rows.Distinct()];
    }

    [Pure]
    private static CalendarTies UntiedOf(int? personId) =>
        new()
        {
            PersonId = personId,
            HoldsRunningMembership = false,
            Pauses = [],
            MemberGroupIds = new HashSet<int>(),
            AdminFunctions = new Dictionary<int, string?>(),
            CastSessions = new HashSet<GroupSession>(),
        };

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

    private sealed record MembershipRow(int PersonId, List<PauseRow> Pauses);

    private sealed record PersonGroupRow(int PersonId, int GroupId);

    private sealed record AdminTenureRow(int PersonId, int GroupId, string? Function);

    private sealed record CastSessionRow(int PersonId, int GroupId, int SessionYear);
}
