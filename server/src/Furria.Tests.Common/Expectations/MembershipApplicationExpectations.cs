using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipApplicationExpectations
{
    private readonly Expected _expected;
    private readonly int _membershipApplicationId;

    internal MembershipApplicationExpectations(Expected expected, int membershipApplicationId)
    {
        _expected = expected;
        _membershipApplicationId = membershipApplicationId;
    }

    public Expected ToExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await ExistsAsync(dbContext, ct),
                    $"Expected a MembershipApplication with id {_membershipApplicationId}."
                )
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await ExistsAsync(dbContext, ct),
                    $"Expected no MembershipApplication with id {_membershipApplicationId}."
                )
        );

    private Task<bool> ExistsAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .MembershipApplications.AsNoTracking()
            .AnyAsync(row => row.Id == _membershipApplicationId, ct);
}
