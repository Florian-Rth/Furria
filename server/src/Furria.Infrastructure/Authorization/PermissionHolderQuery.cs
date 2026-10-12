using System.Diagnostics.Contracts;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Authorization;

public static class PermissionHolderQuery
{
    [Pure]
    public static IQueryable<int> PersonIdsHolding(
        AppDbContext dbContext,
        string permissionKey,
        DateOnly today
    ) =>
        dbContext
            .RoleHoldings.Where(Conferring.RoleHoldings(today))
            .Where(holding =>
                holding.Role!.Permissions.Any(row => row.PermissionKey == permissionKey)
            )
            .Select(holding => holding.PersonId)
            .Union(
                dbContext
                    .BoardSeats.Where(Conferring.BoardSeatRoles(today))
                    .Where(seat =>
                        seat.BoardOffice!.ImpliedRole!.Permissions.Any(row =>
                            row.PermissionKey == permissionKey
                        )
                    )
                    .Select(seat => seat.PersonId)
            );
}
