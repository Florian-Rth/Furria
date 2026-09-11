using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupMembershipExpectations
{
    private readonly Expected _expected;
    private readonly int _groupMembershipId;

    internal GroupMembershipExpectations(Expected expected, int groupMembershipId)
    {
        _expected = expected;
        _groupMembershipId = groupMembershipId;
    }

    public Expected ToHavePeriod(DateOnly joinedOn, DateOnly? leftOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await SingleAsync(dbContext, ct);
                Assert.Equal(joinedOn, membership.JoinedOn);
                Assert.Equal(leftOn, membership.LeftOn);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).LeftOn)
        );

    private Task<GroupMembership> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .GroupMemberships.AsNoTracking()
            .SingleAsync(row => row.Id == _groupMembershipId, ct);
}
