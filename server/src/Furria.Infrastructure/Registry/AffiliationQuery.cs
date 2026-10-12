using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;
using Furria.Core.Ties;

namespace Furria.Infrastructure.Registry;

public static class AffiliationQuery
{
    [Pure]
    public static Expression<Func<Person, bool>> IsAffiliatedOn(DateOnly today) =>
        person =>
            person.Memberships.AsQueryable().Any(Running.Memberships(today))
            || person.GroupMemberships.AsQueryable().Any(Conferring.GroupMemberships(today))
            || person.RoleHoldings.AsQueryable().Any(Conferring.RoleHoldings(today));
}
