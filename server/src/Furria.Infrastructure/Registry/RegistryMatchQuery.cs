using System.Diagnostics.Contracts;
using Furria.Core.Identity;
using Furria.Core.Text;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public static class RegistryMatchQuery
{
    [Pure]
    public static IQueryable<Person> PeopleMatching(
        this AppDbContext dbContext,
        string? email,
        string firstName,
        string lastName,
        DateOnly birthDate
    )
    {
        var normalizedEmail = string.IsNullOrWhiteSpace(email)
            ? null
            : email.Trim().ToUpperInvariant();
        var foldedFirstName = GermanFold.Expand(firstName.Trim());
        var foldedLastName = GermanFold.Expand(lastName.Trim());

        return dbContext
            .People.AsNoTracking()
            .Where(person =>
                (
                    normalizedEmail != null
                    && person.Email != null
                    && person.Email.Trim().ToUpper() == normalizedEmail
                )
                || (
                    person.BirthDate == birthDate
                    && person
                        .FirstName.Trim()
                        .ToLower()
                        .Replace("ß", "ss")
                        .Replace("ä", "ae")
                        .Replace("ö", "oe")
                        .Replace("ü", "ue") == foldedFirstName
                    && person
                        .LastName.Trim()
                        .ToLower()
                        .Replace("ß", "ss")
                        .Replace("ä", "ae")
                        .Replace("ö", "oe")
                        .Replace("ü", "ue") == foldedLastName
                )
            );
    }
}
