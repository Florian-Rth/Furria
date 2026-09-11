using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupAdminSetExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal GroupAdminSetExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .GroupAdmins.AsNoTracking()
                        .CountAsync(row => row.GroupId == _groupId, ct)
                )
        );

    public Expected ToHaveOpenCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .GroupAdmins.AsNoTracking()
                        .CountAsync(row => row.GroupId == _groupId && row.UntilOn == null, ct)
                )
        );
}
