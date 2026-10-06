using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipApplicationSetExpectations
{
    private readonly Expected _expected;

    internal MembershipApplicationSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.MembershipApplications.CountAsync(ct))
        );

    public Expected ToHaveConfirmedCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext.MembershipApplications.CountAsync(
                        application => application.ConfirmedAt != null,
                        ct
                    )
                )
        );
}
