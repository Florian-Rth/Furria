using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerListEnrollmentSetExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal BeerListEnrollmentSetExpectations(Expected expected, int personId)
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
                        .BeerListEnrollments.AsNoTracking()
                        .CountAsync(row => row.PersonId == _personId, ct)
                )
        );

    public Expected ToHaveRunningSince(DateTimeOffset startedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    startedAt,
                    (await RunningAsync(dbContext.BeerListEnrollments, ct)).StartedAt
                )
        );

    private Task<BeerListEnrollment> RunningAsync(
        IQueryable<BeerListEnrollment> enrollments,
        CancellationToken ct
    ) =>
        enrollments
            .AsNoTracking()
            .SingleAsync(row => row.PersonId == _personId && row.EndedAt == null, ct);
}
