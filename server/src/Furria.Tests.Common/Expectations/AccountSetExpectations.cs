using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AccountSetExpectations
{
    private readonly Expected _expected;

    internal AccountSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.Users.AsNoTracking().CountAsync(ct))
        );
}
