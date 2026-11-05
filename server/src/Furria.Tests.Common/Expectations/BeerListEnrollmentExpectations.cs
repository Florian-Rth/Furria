using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerListEnrollmentExpectations
{
    private readonly Expected _expected;
    private readonly int _enrollmentId;

    internal BeerListEnrollmentExpectations(Expected expected, int enrollmentId)
    {
        _expected = expected;
        _enrollmentId = enrollmentId;
    }

    public Expected ToBeEnded(DateTimeOffset endedAt, int? endedByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var enrollment = await SingleAsync(dbContext, ct);
                Assert.Equal(endedAt, enrollment.EndedAt);
                Assert.Equal(endedByPersonId, enrollment.EndedByPersonId);
            }
        );

    private Task<BeerListEnrollment> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .BeerListEnrollments.AsNoTracking()
            .SingleAsync(row => row.Id == _enrollmentId, ct);
}
