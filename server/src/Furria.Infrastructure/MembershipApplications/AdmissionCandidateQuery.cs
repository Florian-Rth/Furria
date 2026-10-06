using System.Diagnostics.Contracts;
using Furria.Core.Identity;
using Furria.Core.Text;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.MembershipApplications;

public static class AdmissionCandidateQuery
{
    [Pure]
    public static IQueryable<Person> AdmissionCandidates(
        this AppDbContext dbContext,
        ApplicantKey applicant
    )
    {
        var email = applicant.Email.Trim().ToUpperInvariant();
        var firstName = GermanFold.Expand(applicant.FirstName.Trim());
        var lastName = GermanFold.Expand(applicant.LastName.Trim());
        var birthDate = applicant.BirthDate;

        return dbContext
            .People.AsNoTracking()
            .Where(person =>
                (person.Email != null && person.Email.Trim().ToUpper() == email)
                || (
                    person.BirthDate == birthDate
                    && person
                        .FirstName.Trim()
                        .ToLower()
                        .Replace("ß", "ss")
                        .Replace("ä", "ae")
                        .Replace("ö", "oe")
                        .Replace("ü", "ue") == firstName
                    && person
                        .LastName.Trim()
                        .ToLower()
                        .Replace("ß", "ss")
                        .Replace("ä", "ae")
                        .Replace("ö", "oe")
                        .Replace("ü", "ue") == lastName
                )
            );
    }
}
