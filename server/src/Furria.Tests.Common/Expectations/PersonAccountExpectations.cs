using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PersonAccountExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal PersonAccountExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToHaveLoginEmail(string email) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var account = await dbContext
                    .Users.AsNoTracking()
                    .SingleAsync(row => row.PersonId == _personId, ct);

                Assert.Equal(email, account.Email);
            }
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .Users.AsNoTracking()
                        .AnyAsync(row => row.PersonId == _personId, ct),
                    $"Expected no Account for person {_personId}."
                )
        );
}
