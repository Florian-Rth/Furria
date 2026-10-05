using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public static class CalendarTiesQuery
{
    public static async Task<CalendarTies> CalendarTiesOfAsync(
        this AppDbContext dbContext,
        int personId,
        DateOnly today,
        CancellationToken ct
    )
    {
        var runningMembershipPauses = await dbContext
            .Memberships.AsNoTracking()
            .Where(membership =>
                membership.PersonId == personId
                && membership.StartedOn <= today
                && (membership.EndedOn == null || membership.EndedOn >= today)
            )
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
        };
    }

    [Pure]
    public static IQueryable<int> TiedGroupIds(
        this AppDbContext dbContext,
        int personId,
        DateOnly today
    ) =>
        dbContext
            .RunningGroupMemberships(personId, today)
            .Select(membership => membership.GroupId)
            .Concat(
                dbContext.RunningGroupAdminTenures(personId, today).Select(admin => admin.GroupId)
            );

    [Pure]
    private static IQueryable<GroupMembership> RunningGroupMemberships(
        this AppDbContext dbContext,
        int personId,
        DateOnly today
    ) =>
        dbContext.GroupMemberships.Where(membership =>
            membership.PersonId == personId
            && membership.JoinedOn <= today
            && (membership.LeftOn == null || membership.LeftOn >= today)
            && membership.Group!.ArchivedOn == null
        );

    [Pure]
    private static IQueryable<GroupAdmin> RunningGroupAdminTenures(
        this AppDbContext dbContext,
        int personId,
        DateOnly today
    ) =>
        dbContext.GroupAdmins.Where(admin =>
            admin.PersonId == personId
            && admin.SinceOn <= today
            && (admin.UntilOn == null || admin.UntilOn >= today)
            && admin.Group!.ArchivedOn == null
        );

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
