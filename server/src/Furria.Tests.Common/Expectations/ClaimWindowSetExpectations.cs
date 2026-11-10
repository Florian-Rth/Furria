using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class ClaimWindowSetExpectations
{
    private readonly Expected _expected;

    internal ClaimWindowSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.ClaimWindows.CountAsync(ct))
        );

    public Expected ToHaveLatestEndingAt(DateTimeOffset closesAt, int? openedByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var latest = await LatestAsync(dbContext, ct);
                Assert.Null(latest.ClosedAt);
                Assert.Equal(closesAt, latest.ClosesAt);
                Assert.Equal(openedByPersonId, latest.OpenedByPersonId);
            }
        );

    public Expected ToHaveLatestClosedAt(DateTimeOffset closedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(closedAt, (await LatestAsync(dbContext, ct)).ClosedAt)
        );

    private static Task<ClaimWindow> LatestAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .ClaimWindows.AsNoTracking()
            .OrderByDescending(window => window.OpenedAt)
            .ThenByDescending(window => window.Id)
            .FirstAsync(ct);
}
