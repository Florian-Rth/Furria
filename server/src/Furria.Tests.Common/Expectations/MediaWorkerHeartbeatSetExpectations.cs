using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MediaWorkerHeartbeatSetExpectations
{
    private readonly Expected _expected;

    internal MediaWorkerHeartbeatSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.MediaWorkerHeartbeats.CountAsync(ct))
        );
}
