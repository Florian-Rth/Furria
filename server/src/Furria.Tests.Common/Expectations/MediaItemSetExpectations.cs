using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MediaItemSetExpectations
{
    private readonly Expected _expected;

    internal MediaItemSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(count, await dbContext.MediaItems.CountAsync(ct))
        );
}
