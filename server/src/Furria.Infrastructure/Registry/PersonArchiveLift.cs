using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public static class PersonArchiveLift
{
    public static Task LiftArchiveOfAsync(
        this AppDbContext dbContext,
        int personId,
        CancellationToken ct
    ) => dbContext.LiftArchivesAsync(dbContext.People.Where(person => person.Id == personId), ct);

    public static async Task LiftArchivesAsync(
        this AppDbContext dbContext,
        IQueryable<Person> people,
        CancellationToken ct
    )
    {
        var archived = await people.Where(person => person.ArchivedOn != null).ToListAsync(ct);

        foreach (var person in archived)
        {
            person.LiftArchive();
        }
    }

    public static void LiftArchive(this Person person)
    {
        person.ArchivedOn = null;
        person.ArchivedByPersonId = null;
    }
}
