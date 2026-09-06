using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal MembershipExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .Memberships.AsNoTracking()
                        .AnyAsync(row => row.PersonId == _personId, ct),
                    $"Expected no Mitgliedschaft for the Person with id {_personId}."
                )
        );

    public Expected ToHave(MembershipType type, MembershipStatus status) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await SingleAsync(dbContext, ct);
                Assert.Equal(type, membership.Type);
                Assert.Equal(status, membership.Status);
            }
        );

    public Expected ToHavePeriod(DateOnly startedAt, DateOnly? endedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await SingleAsync(dbContext, ct);
                Assert.Equal(startedAt, membership.StartedAt);
                Assert.Equal(endedAt, membership.EndedAt);
            }
        );

    private Task<Membership> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Memberships.AsNoTracking().SingleAsync(row => row.PersonId == _personId, ct);
}
