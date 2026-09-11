using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipExpectations
{
    private readonly Expected _expected;
    private readonly int _membershipId;

    internal MembershipExpectations(Expected expected, int membershipId)
    {
        _expected = expected;
        _membershipId = membershipId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .Memberships.AsNoTracking()
                        .AnyAsync(row => row.Id == _membershipId, ct),
                    $"Expected no Mitgliedschaft with id {_membershipId}."
                )
        );

    public Expected ToHavePeriod(DateOnly startedOn, DateOnly? endedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await SingleAsync(dbContext, ct);
                Assert.Equal(startedOn, membership.StartedOn);
                Assert.Equal(endedOn, membership.EndedOn);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await SingleAsync(dbContext, ct);
                Assert.Null(membership.EndedOn);
            }
        );

    private Task<Membership> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Memberships.AsNoTracking().SingleAsync(row => row.Id == _membershipId, ct);
}
