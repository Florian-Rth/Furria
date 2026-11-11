using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MatcherStatementSetExpectations
{
    private readonly Expected _expected;

    internal MatcherStatementSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.MatcherStatements.AsNoTracking().CountAsync(ct))
        );
}
