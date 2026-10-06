using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Authorization;

public static class PermissionHolderQuery
{
    [Pure]
    public static Expression<Func<RoleHolding, bool>> RoleHoldingGrantsOn(DateOnly today) =>
        holding =>
            holding.SinceOn <= today
            && (holding.UntilOn == null || holding.UntilOn >= today)
            && holding.Role!.ArchivedOn == null;

    [Pure]
    public static Expression<Func<BoardSeat, bool>> BoardSeatGrantsOn(DateOnly today) =>
        seat =>
            seat.SinceOn <= today
            && (seat.UntilOn == null || seat.UntilOn >= today)
            && seat.BoardOffice!.ImpliedRoleId != null
            && seat.BoardOffice!.ImpliedRole!.ArchivedOn == null;

    [Pure]
    public static IQueryable<int> PersonIdsHolding(
        AppDbContext dbContext,
        string permissionKey,
        DateOnly today
    ) =>
        dbContext
            .RoleHoldings.Where(RoleHoldingGrantsOn(today))
            .Where(holding =>
                holding.Role!.Permissions.Any(row => row.PermissionKey == permissionKey)
            )
            .Select(holding => holding.PersonId)
            .Union(
                dbContext
                    .BoardSeats.Where(BoardSeatGrantsOn(today))
                    .Where(seat =>
                        seat.BoardOffice!.ImpliedRole!.Permissions.Any(row =>
                            row.PermissionKey == permissionKey
                        )
                    )
                    .Select(seat => seat.PersonId)
            );
}
