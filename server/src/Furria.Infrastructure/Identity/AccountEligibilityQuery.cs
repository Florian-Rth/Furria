using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Identity;
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
            : person.Email == null || person.Email == "" ? AccountIneligibilityReason.NoEmail
            : null;

        return WithAffiliation(reasonGivenAffiliation, AffiliationQuery.IsAffiliatedOn(today));
    }

    [Pure]
    public static Expression<Func<Person, bool>> IsEligibleOn(DateOnly today, int ageOfConsent) =>
        ReasonIs(ReasonAgainstOn(today, ageOfConsent), null);

    [Pure]
    public static Expression<Func<Person, bool>> IsIneligibleOn(DateOnly today, int ageOfConsent)
    {
        var eligible = IsEligibleOn(today, ageOfConsent);

        return Expression.Lambda<Func<Person, bool>>(
            Expression.Not(eligible.Body),
            eligible.Parameters
        );
    }

    [Pure]
    public static Expression<Func<Person, bool>> LacksOnlyAnEmailOn(
        DateOnly today,
        int ageOfConsent
    ) => ReasonIs(ReasonAgainstOn(today, ageOfConsent), AccountIneligibilityReason.NoEmail);

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

    [Pure]
    private static Expression<Func<Person, AccountIneligibilityReason?>> WithAffiliation(
        Expression<Func<Person, bool, AccountIneligibilityReason?>> reasonGivenAffiliation,
        Expression<Func<Person, bool>> isAffiliated
    )
    {
        var person = reasonGivenAffiliation.Parameters[0];
        var affiliationOfPerson = ParameterSubstitution.Replace(
            isAffiliated.Body,
            isAffiliated.Parameters[0],
            person
        );
        var body = ParameterSubstitution.Replace(
            reasonGivenAffiliation.Body,
            reasonGivenAffiliation.Parameters[1],
            affiliationOfPerson
        );

        return Expression.Lambda<Func<Person, AccountIneligibilityReason?>>(body, person);
    }

    private sealed class ParameterSubstitution : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;
        private readonly Expression _replacement;

        private ParameterSubstitution(ParameterExpression parameter, Expression replacement)
        {
            _parameter = parameter;
            _replacement = replacement;
        }

        public static Expression Replace(
            Expression body,
            ParameterExpression parameter,
            Expression replacement
        ) => new ParameterSubstitution(parameter, replacement).Visit(body);

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _parameter ? _replacement : base.VisitParameter(node);
    }
}
