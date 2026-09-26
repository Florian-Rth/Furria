using System.Diagnostics.Contracts;
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

        return filter switch
        {
            PersonAccessFilter.None => dbContext
                .EligibleWithoutAccount(today, ageOfConsent)
                .WithoutUnexpiredLiveInvitation(dbContext, now),
            PersonAccessFilter.Invited => dbContext
                .PeopleWithoutAccount()
                .WithUnexpiredLiveInvitation(dbContext, now),
            PersonAccessFilter.Active => dbContext.PeopleWithAccount(isDisabled: false),
            PersonAccessFilter.Disabled => dbContext.PeopleWithAccount(isDisabled: true),
            PersonAccessFilter.NotInvitable => dbContext
                .PeopleWithoutAccount()
                .WithoutUnexpiredLiveInvitation(dbContext, now)
                .Where(AccountEligibilityQuery.IsIneligibleOn(today, ageOfConsent)),
            PersonAccessFilter.WithAccess => dbContext.PeopleWithAccessOn(today),
            PersonAccessFilter.OpenInvitation => dbContext.PeopleWithOpenInvitation(),
            PersonAccessFilter.WithoutEmail => dbContext.EligibleWithoutEmail(today, ageOfConsent),
            _ => throw new ArgumentOutOfRangeException(nameof(filter), filter, null),
        };
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
            .PeopleWithoutAccount()
            .Where(AccountEligibilityQuery.LacksOnlyAnEmailOn(today, ageOfConsent));

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
    public static IQueryable<Person> WithUnexpiredLiveInvitation(
        this IQueryable<Person> people,
        AppDbContext dbContext,
        DateTimeOffset now
    ) =>
        people.Where(person =>
            dbContext.Invitations.Any(invitation =>
                invitation.PersonId == person.Id
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
                && invitation.ExpiresAt > now
            )
        );

    [Pure]
    public static IQueryable<Person> WithoutUnexpiredLiveInvitation(
        this IQueryable<Person> people,
        AppDbContext dbContext,
        DateTimeOffset now
    ) =>
        people.Where(person =>
            !dbContext.Invitations.Any(invitation =>
                invitation.PersonId == person.Id
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
                && invitation.ExpiresAt > now
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
}
