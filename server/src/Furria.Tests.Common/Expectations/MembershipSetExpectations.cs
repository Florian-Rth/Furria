using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MembershipSetExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal MembershipSetExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .Memberships.AsNoTracking()
                        .CountAsync(row => row.PersonId == _personId, ct)
                )
        );

    public Expected ToHaveOpenCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .Memberships.AsNoTracking()
                        .CountAsync(row => row.PersonId == _personId && row.EndedOn == null, ct)
                )
        );

    public Expected ToHaveOnlyOneFromIntake(int intakeId, DateOnly startedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await dbContext
                    .Memberships.AsNoTracking()
                    .SingleAsync(row => row.PersonId == _personId, ct);
                Assert.Equal(intakeId, membership.IntakeId);
                Assert.Equal(startedOn, membership.StartedOn);
                Assert.Null(membership.EndedOn);
                Assert.Null(membership.AdmittedAt);
            }
        );

    public Expected ToHaveOneFromIntakeSince(int intakeId, DateOnly startedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var membership = await dbContext
                    .Memberships.AsNoTracking()
                    .SingleAsync(row => row.PersonId == _personId && row.IntakeId == intakeId, ct);
                Assert.Equal(startedOn, membership.StartedOn);
                Assert.Null(membership.EndedOn);
            }
        );
}
