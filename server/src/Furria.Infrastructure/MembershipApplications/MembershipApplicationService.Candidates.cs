using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.MembershipApplications;
using Furria.Core.Identity;
using Furria.Core.MembershipApplications;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.MembershipApplications;

public sealed partial class MembershipApplicationService
{
    private async Task<IReadOnlyList<AdmissionCandidate>> CandidatesAsync(
        UndecidedApplicationRow application,
        DateOnly today,
        CancellationToken ct
    )
    {
        var affiliated = _dbContext.People.Where(AffiliationQuery.IsAffiliatedOn(today));
        var rows = await _dbContext
            .AdmissionCandidates(application.Key)
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new CandidateRow(
                person.Id,
                person.FirstName,
                person.LastName,
                person.BirthDate,
                new ContactDetails
                {
                    Email = person.Email,
                    Phone = person.Phone,
                    Street = person.Street,
                    Zip = person.Zip,
                    City = person.City,
                },
                person.Memberships.AsQueryable().Select(MembershipPeriodRow.Projection).ToList(),
                person
                    .GroupMemberships.AsQueryable()
                    .Where(Conferring.GroupMemberships(today))
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Group!.Name, GermanCollation.Name)
                    )
                    .Select(membership => membership.Group!.Name)
                    .ToList(),
                person
                    .RoleHoldings.AsQueryable()
                    .Where(Conferring.RoleHoldings(today))
                    .OrderBy(holding =>
                        EF.Functions.Collate(holding.Role!.Name, GermanCollation.Name)
                    )
                    .Select(holding => holding.Role!.Name)
                    .ToList(),
                _dbContext.Users.Any(account => account.PersonId == person.Id),
                affiliated.Any(running => running.Id == person.Id)
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToCandidate(row, application.Contact, today))];
    }

    [Pure]
    private static AdmissionCandidate ToCandidate(
        CandidateRow row,
        ContactDetails applied,
        DateOnly today
    )
    {
        var periods = MembershipPeriodRow.PeriodsOf(row.Memberships, today);
        var chain = MembershipChainDetails.Of(periods, today);

        return new AdmissionCandidate
        {
            PersonId = row.Id,
            FirstName = row.FirstName,
            LastName = row.LastName,
            BirthDate = row.BirthDate,
            Email = row.Contact.Email,
            City = row.Contact.City,
            MembershipState = chain.State,
            MemberSince = chain.MemberSince,
            IsMember = periods.Any(period => !period.ToPeriod().HasEndedBefore(today)),
            Groups = row.Groups,
            Roles = row.Roles,
            HasAccount = row.HasAccount,
            IsAffiliated = row.IsAffiliated,
            Gaps = RegistryGaps.Of(row.BirthDate, row.Contact, applied),
        };
    }

    private sealed record CandidateRow(
        int Id,
        string FirstName,
        string LastName,
        DateOnly? BirthDate,
        ContactDetails Contact,
        IReadOnlyList<MembershipPeriodRow> Memberships,
        IReadOnlyList<string> Groups,
        IReadOnlyList<string> Roles,
        bool HasAccount,
        bool IsAffiliated
    );
}
