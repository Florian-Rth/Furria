using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Ties;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class AnnouncementAddOnRules
{
    internal static async Task<bool> MayManageAnnouncementAsync(
        this PermissionAuthorizer authorizer,
        int actorAccountId,
        int? authorPersonId,
        CancellationToken ct
    ) =>
        authorPersonId is { } author
            && await authorizer.ActivePersonIdAsync(actorAccountId, ct) == author
        || await authorizer.IsGrantedAsync(actorAccountId, FurriaPermissions.AnnouncementsPost, ct);

    internal static Task<IReadOnlySet<int>> AnnouncementConcernedIdsAsync(
        this AppDbContext dbContext,
        DateOnly today,
        CancellationToken ct
    ) =>
        dbContext.UnpausedMemberIdsAsync(
            dbContext.Memberships.Where(Running.Memberships(today)),
            today,
            ct
        );

    internal static async Task<bool> IsConcernedByAnnouncementsAsync(
        this AppDbContext dbContext,
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        (
            await dbContext.UnpausedMemberIdsAsync(
                dbContext
                    .Memberships.Where(Running.Memberships(today))
                    .Where(membership => membership.PersonId == personId),
                today,
                ct
            )
        ).Count > 0;

    private static async Task<IReadOnlySet<int>> UnpausedMemberIdsAsync(
        this AppDbContext dbContext,
        IQueryable<Membership> running,
        DateOnly today,
        CancellationToken ct
    )
    {
        var memberships = await running
            .AsNoTracking()
            .Select(membership => new RunningMembershipRow(
                membership.PersonId,
                membership
                    .Pauses.Select(pause => new PauseRow(
                        pause.FirstSessionYear,
                        pause.LastSessionYear
                    ))
                    .ToList()
            ))
            .ToListAsync(ct);

        return UnpausedIdsOf(memberships, ClubSession.YearOf(today));
    }

    [Pure]
    private static IReadOnlySet<int> UnpausedIdsOf(
        IReadOnlyList<RunningMembershipRow> memberships,
        int sessionYear
    ) =>
        memberships
            .Where(membership => !membership.Pauses.Any(pause => pause.Covers(sessionYear)))
            .Select(membership => membership.PersonId)
            .ToHashSet();

    private sealed record RunningMembershipRow(int PersonId, IReadOnlyList<PauseRow> Pauses);

    private sealed record PauseRow(int FirstSessionYear, int? LastSessionYear)
    {
        [Pure]
        public bool Covers(int sessionYear) =>
            new SessionSpan { FirstYear = FirstSessionYear, LastYear = LastSessionYear }.Contains(
                sessionYear
            );
    }
}
