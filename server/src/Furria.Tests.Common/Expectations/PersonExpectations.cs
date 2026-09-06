using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PersonExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal PersonExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext.People.AsNoTracking().AnyAsync(row => row.Id == _personId, ct),
                    $"Expected a Person with id {_personId}."
                )
        );

    public Expected ToHaveName(string firstName, string lastName) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var person = await dbContext
                    .People.AsNoTracking()
                    .SingleAsync(row => row.Id == _personId, ct);

                Assert.Equal(firstName, person.FirstName);
                Assert.Equal(lastName, person.LastName);
            }
        );
}
