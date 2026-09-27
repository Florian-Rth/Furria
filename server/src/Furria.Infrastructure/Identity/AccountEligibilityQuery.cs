using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;

namespace Furria.Infrastructure.Identity;

public static class AccountEligibilityQuery
{
    [Pure]
    public static Expression<Func<Person, AccountIneligibilityReason?>> ReasonAgainstOn(
        DateOnly today,
        int ageOfConsent
    )
    {
        Expression<Func<Person, bool, AccountIneligibilityReason?>> reasonGivenAffiliation = (
            person,
            isAffiliated
        ) =>
            !isAffiliated ? AccountIneligibilityReason.NotAffiliated
            : person.BirthDate == null ? AccountIneligibilityReason.NoBirthDate
            : person.BirthDate.Value.AddYears(ageOfConsent) > today
                ? AccountIneligibilityReason.UnderAge
            : null;

        return ExpressionComposition.Bind(
            reasonGivenAffiliation,
            AffiliationQuery.IsAffiliatedOn(today)
        );
    }

    [Pure]
    public static Expression<Func<Person, bool>> IsEligibleOn(DateOnly today, int ageOfConsent) =>
        ReasonIs(ReasonAgainstOn(today, ageOfConsent), null);

    [Pure]
    public static Expression<Func<Person, bool>> CanBeMailed() =>
        person => person.Email != null && person.Email != "";

    [Pure]
    public static Expression<Func<Person, bool>> CannotBeMailed() =>
        person => person.Email == null || person.Email == "";

    [Pure]
    private static Expression<Func<Person, bool>> ReasonIs(
        Expression<Func<Person, AccountIneligibilityReason?>> reasonAgainst,
        AccountIneligibilityReason? reason
    ) =>
        Expression.Lambda<Func<Person, bool>>(
            Expression.Equal(
                reasonAgainst.Body,
                Expression.Constant(reason, typeof(AccountIneligibilityReason?))
            ),
            reasonAgainst.Parameters
        );
}
