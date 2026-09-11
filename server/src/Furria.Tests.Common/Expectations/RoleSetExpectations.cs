using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class RoleSetExpectations
{
    private readonly Expected _expected;

    internal RoleSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.Roles.AsNoTracking().CountAsync(ct))
        );
}
