using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipSetExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal MembershipSetExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .Memberships.AsNoTracking()
                        .CountAsync(row => row.PersonId == _personId, ct)
                )
        );

    public Expected ToHaveOpenCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .Memberships.AsNoTracking()
                        .CountAsync(row => row.PersonId == _personId && row.EndedOn == null, ct)
                )
        );
}
