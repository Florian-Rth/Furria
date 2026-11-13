using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class AddOnConcern
{
    internal static readonly IReadOnlyList<CalendarAttendancePerson> NobodyNamed = [];
    internal static readonly IReadOnlySet<int> NobodyReachable = new HashSet<int>();

    internal static async Task<IReadOnlyList<CalendarAttendancePerson>> PeopleNamedAsync(
        this AppDbContext dbContext,
        IReadOnlySet<int> personIds,
        CancellationToken ct
    ) =>
        await dbContext
            .People.AsNoTracking()
            .Where(person => personIds.Contains(person.Id))
            .OrderBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new CalendarAttendancePerson
            {
                PersonId = person.Id,
                FirstName = person.FirstName,
                LastName = person.LastName,
            })
            .ToListAsync(ct);

    [Pure]
    internal static IReadOnlySet<int> SignedUpIdsOf(SignUpListDetails list) =>
        list.Lines.Select(line => line.PersonId).ToHashSet();

    [Pure]
    internal static CalendarReminderDetails ReminderOf(
        DateTimeOffset? lastRemindedAt,
        IReadOnlySet<int> reachable,
        IReadOnlySet<int> answeredIds
    ) =>
        new()
        {
            LastRemindedAt = lastRemindedAt,
            RemindableFrom = CalendarReminderRules.RemindableFrom(lastRemindedAt),
            ReachableCount = reachable.Count(personId => !answeredIds.Contains(personId)),
        };

    [Pure]
    internal static int ShareTotalOf(IReadOnlySet<int> concerned, IReadOnlySet<int> answeredIds) =>
        concerned.Count + answeredIds.Count(personId => !concerned.Contains(personId));

    [Pure]
    internal static IReadOnlyList<CalendarAttendancePerson> MissingFrom(
        IReadOnlyList<CalendarAttendancePerson> named,
        IReadOnlySet<int> answeredIds
    ) => [.. named.Where(person => !answeredIds.Contains(person.PersonId))];
}
