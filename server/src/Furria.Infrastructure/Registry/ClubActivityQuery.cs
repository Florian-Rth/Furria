using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Registry;

public static class ClubActivityQuery
{
    [Pure]
    public static Expression<Func<Person, bool>> IsActiveInClubOn(
        this AppDbContext dbContext,
        DateOnly today
    )
    {
        Expression<Func<Person, bool, bool>> activeGivenAffiliation = (person, isAffiliated) =>
            isAffiliated
            || person.GroupAdminships.Any(tenure =>
                tenure.SinceOn <= today
                && (tenure.UntilOn == null || tenure.UntilOn >= today)
                && tenure.Group!.ArchivedOn == null
            )
            || dbContext.BoardSeats.Any(seat =>
                seat.PersonId == person.Id
                && seat.SinceOn <= today
                && (seat.UntilOn == null || seat.UntilOn >= today)
                && seat.BoardOffice!.ArchivedOn == null
            );

        return ExpressionComposition.Bind(
            activeGivenAffiliation,
            AffiliationQuery.IsAffiliatedOn(today)
        );
    }
}
