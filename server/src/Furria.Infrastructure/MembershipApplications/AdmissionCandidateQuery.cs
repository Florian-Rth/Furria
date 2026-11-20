using System.Diagnostics.Contracts;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;

namespace Furria.Infrastructure.MembershipApplications;

public static class AdmissionCandidateQuery
{
    [Pure]
    public static IQueryable<Person> AdmissionCandidates(
        this AppDbContext dbContext,
        ApplicantKey applicant
    ) =>
        dbContext.PeopleMatching(
            applicant.Email,
            applicant.FirstName,
            applicant.LastName,
            applicant.BirthDate
        );
}
