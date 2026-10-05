using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Identity;

public static class AccessQuery
{
    public static async Task<int> AgeOfConsentAsync(
        this AppDbContext dbContext,
        CancellationToken ct
    ) =>
        await dbContext
            .ClubRecords.AsNoTracking()
            .Where(record => record.Id == ClubRecord.TheOnlyId)
            .Select(record => (int?)record.AgeOfConsent)
            .SingleOrDefaultAsync(ct)
        ?? ClubRecord.DefaultAgeOfConsent;

    [Pure]
    public static IQueryable<Person> PeopleByAccess(
        this AppDbContext dbContext,
        PersonAccessFilter filter,
        DateTimeOffset now,
        int ageOfConsent
    )
    {
        var today = ClubClock.DayOf(now);

        if (StateFiltered(filter) is { } state)
            return dbContext.PeopleInAccessState(state, now, ageOfConsent);

        return filter switch
        {
            PersonAccessFilter.WithAccess => dbContext.PeopleWithAccessOn(today),
            PersonAccessFilter.OpenInvitation => dbContext.PeopleWithOpenInvitation(),
            PersonAccessFilter.WithoutEmail => dbContext.EligibleWithoutEmail(today, ageOfConsent),
            PersonAccessFilter.BirthDateUnknown => dbContext.BirthDateUnknown(today),
            _ => throw new ArgumentOutOfRangeException(nameof(filter), filter, null),
        };
    }

    [Pure]
    public static Expression<Func<Person, RegisterAccessState>> AccessStateOn(
        this AppDbContext dbContext,
        DateTimeOffset now,
        int ageOfConsent
    )
    {
        Expression<Func<Person, bool, RegisterAccessState>> stateGivenEligibility = (
            person,
            isEligible
        ) =>
            dbContext.Users.Any(account => account.PersonId == person.Id && account.IsDisabled)
                ? RegisterAccessState.Disabled
            : dbContext.Users.Any(account => account.PersonId == person.Id)
                ? RegisterAccessState.Active
            : dbContext.Invitations.Any(invitation =>
                invitation.PersonId == person.Id
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
                && invitation.ExpiresAt > now
            )
                ? RegisterAccessState.Invited
            : isEligible ? RegisterAccessState.None
            : RegisterAccessState.NotInvitable;

        return ExpressionComposition.Bind(
            stateGivenEligibility,
            AccountEligibilityQuery.IsEligibleOn(ClubClock.DayOf(now), ageOfConsent)
        );
    }

    [Pure]
    public static IQueryable<Person> PeopleInAccessState(
        this AppDbContext dbContext,
        RegisterAccessState state,
        DateTimeOffset now,
        int ageOfConsent
    )
    {
        var stateOf = dbContext.AccessStateOn(now, ageOfConsent);

        return dbContext.People.Where(
            Expression.Lambda<Func<Person, bool>>(
                Expression.Equal(stateOf.Body, Expression.Constant(state)),
                stateOf.Parameters
            )
        );
    }

    [Pure]
    public static IQueryable<Person> PeopleWithoutAccount(this AppDbContext dbContext) =>
        dbContext.People.Where(person =>
            !dbContext.Users.Any(account => account.PersonId == person.Id)
        );

    [Pure]
    public static IQueryable<Person> PeopleWithAccount(
        this AppDbContext dbContext,
        bool isDisabled
    ) =>
        dbContext.People.Where(person =>
            dbContext.Users.Any(account =>
                account.PersonId == person.Id && account.IsDisabled == isDisabled
            )
        );

    [Pure]
    public static IQueryable<Person> PeopleWithAccessOn(
        this AppDbContext dbContext,
        DateOnly today
    ) =>
        dbContext
            .PeopleWithAccount(isDisabled: false)
            .Where(AffiliationQuery.IsAffiliatedOn(today));

    [Pure]
    public static IQueryable<Person> PeopleWithOpenInvitation(this AppDbContext dbContext)
    {
        var openInvitations = dbContext.OpenInvitations();

        return dbContext.People.Where(person =>
            openInvitations.Any(invitation => invitation.PersonId == person.Id)
        );
    }

    [Pure]
    public static IQueryable<Person> EligibleWithoutEmail(
        this AppDbContext dbContext,
        DateOnly today,
        int ageOfConsent
    ) =>
        dbContext
            .EligibleWithoutAccount(today, ageOfConsent)
            .Where(AccountEligibilityQuery.CannotBeMailed());

    [Pure]
    public static IQueryable<Person> EligibleWithoutAccount(
        this AppDbContext dbContext,
        DateOnly today,
        int ageOfConsent
    ) =>
        dbContext
            .PeopleWithoutAccount()
            .Where(AccountEligibilityQuery.IsEligibleOn(today, ageOfConsent));

    [Pure]
    public static IQueryable<Person> EligibleForMailWithoutAccount(
        this AppDbContext dbContext,
        DateOnly today,
        int ageOfConsent
    ) =>
        dbContext
            .EligibleWithoutAccount(today, ageOfConsent)
            .Where(AccountEligibilityQuery.CanBeMailed());

    [Pure]
    public static IQueryable<Person> BirthDateUnknown(this AppDbContext dbContext, DateOnly today)
    {
        var openInvitations = dbContext.OpenInvitations();

        return dbContext
            .PeopleWithoutAccount()
            .Where(AffiliationQuery.IsAffiliatedOn(today))
            .Where(person =>
                person.BirthDate == null
                && !openInvitations.Any(invitation => invitation.PersonId == person.Id)
            );
    }

    [Pure]
    public static IQueryable<Person> NeverInvited(
        this IQueryable<Person> people,
        AppDbContext dbContext
    ) =>
        people.Where(person =>
            !dbContext.Invitations.Any(invitation =>
                invitation.PersonId == person.Id
                && invitation.Purpose == InvitationPurpose.Onboarding
            )
        );

    [Pure]
    public static IQueryable<Invitation> OpenInvitations(this AppDbContext dbContext) =>
        dbContext.Invitations.Where(invitation =>
            invitation.Purpose == InvitationPurpose.Onboarding
            && invitation.RedeemedAt == null
            && invitation.VoidedAt == null
            && !dbContext.Users.Any(account => account.PersonId == invitation.PersonId)
        );

    [Pure]
    private static RegisterAccessState? StateFiltered(PersonAccessFilter filter) =>
        filter switch
        {
            PersonAccessFilter.None => RegisterAccessState.None,
            PersonAccessFilter.Invited => RegisterAccessState.Invited,
            PersonAccessFilter.Active => RegisterAccessState.Active,
            PersonAccessFilter.Disabled => RegisterAccessState.Disabled,
            PersonAccessFilter.NotInvitable => RegisterAccessState.NotInvitable,
            _ => null,
        };
}
