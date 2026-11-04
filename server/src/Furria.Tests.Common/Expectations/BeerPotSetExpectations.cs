using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerPotSetExpectations
{
    private readonly Expected _expected;

    internal BeerPotSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.BeerPots.AsNoTracking().CountAsync(ct))
        );
}
