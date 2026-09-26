using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PersonAccountEventExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal PersonAccountEventExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToHaveKindsInOrder(params AccountEventKind[] kinds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    kinds,
                    await dbContext
                        .AccountEvents.AsNoTracking()
                        .Where(accountEvent => accountEvent.PersonId == _personId)
                        .OrderBy(accountEvent => accountEvent.Id)
                        .Select(accountEvent => accountEvent.Kind)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveLatestActor(int actorPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    actorPersonId,
                    await dbContext
                        .AccountEvents.AsNoTracking()
                        .Where(accountEvent => accountEvent.PersonId == _personId)
                        .OrderByDescending(accountEvent => accountEvent.Id)
                        .Select(accountEvent => accountEvent.ActorPersonId)
                        .FirstAsync(ct)
                )
        );
}
