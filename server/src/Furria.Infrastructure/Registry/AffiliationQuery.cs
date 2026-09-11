using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;

namespace Furria.Infrastructure.Registry;

public static class AffiliationQuery
{
    [Pure]
    public static Expression<Func<Person, bool>> IsAffiliatedOn(DateOnly today) =>
        person =>
            person.Memberships.Any(membership =>
                membership.StartedOn <= today
                && (membership.EndedOn == null || membership.EndedOn >= today)
            )
            || person.GroupMemberships.Any(membership =>
                membership.JoinedOn <= today
                && (membership.LeftOn == null || membership.LeftOn >= today)
                && membership.Group!.ArchivedOn == null
            )
            || person.RoleHoldings.Any(holding =>
                holding.SinceOn <= today
                && (holding.UntilOn == null || holding.UntilOn >= today)
                && holding.Role!.ArchivedOn == null
            );
}
