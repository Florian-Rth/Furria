using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;
using Furria.Core.Ties;
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
            || person.GroupAdminships.AsQueryable().Any(Conferring.GroupAdmins(today))
            || dbContext
                .BoardSeats.Where(Conferring.BoardSeats(today))
                .Any(seat => seat.PersonId == person.Id);

        return ExpressionComposition.Bind(
            activeGivenAffiliation,
            AffiliationQuery.IsAffiliatedOn(today)
        );
    }
}
