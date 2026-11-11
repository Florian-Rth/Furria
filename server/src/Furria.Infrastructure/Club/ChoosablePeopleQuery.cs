using System.Diagnostics.Contracts;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Club;

internal static class ChoosablePeopleQuery
{
    [Pure]
    internal static IQueryable<int> ChoosablePersonIds(
        this AppDbContext dbContext,
        DateOnly today
    ) =>
        dbContext
            .Memberships.Where(Running.Memberships(today))
            .Select(membership => membership.PersonId)
            .Concat(
                dbContext
                    .GroupMemberships.Where(Conferring.GroupMemberships(today))
                    .Select(membership => membership.PersonId)
            )
            .Concat(
                dbContext
                    .GroupAdmins.Where(Conferring.GroupAdmins(today))
                    .Select(admin => admin.PersonId)
            );
}
