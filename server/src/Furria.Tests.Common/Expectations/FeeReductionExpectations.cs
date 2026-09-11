using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class FeeReductionExpectations
{
    private readonly Expected _expected;
    private readonly int _feeReductionId;

    internal FeeReductionExpectations(Expected expected, int feeReductionId)
    {
        _expected = expected;
        _feeReductionId = feeReductionId;
    }

    public Expected ToHaveBasis(FeeReductionBasis basis) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(basis, (await SingleAsync(dbContext, ct)).Basis)
        );

    public Expected ToHaveSpan(int firstSessionYear, int lastSessionYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var reduction = await SingleAsync(dbContext, ct);
                Assert.Equal(firstSessionYear, reduction.FirstSessionYear);
                Assert.Equal(lastSessionYear, reduction.LastSessionYear);
            }
        );

    private Task<FeeReduction> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.FeeReductions.AsNoTracking().SingleAsync(row => row.Id == _feeReductionId, ct);
}
