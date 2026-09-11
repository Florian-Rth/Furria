using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class RoleHoldingExpectations
{
    private readonly Expected _expected;
    private readonly int _roleHoldingId;

    internal RoleHoldingExpectations(Expected expected, int roleHoldingId)
    {
        _expected = expected;
        _roleHoldingId = roleHoldingId;
    }

    public Expected ToHavePeriod(DateOnly sinceOn, DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var holding = await SingleAsync(dbContext, ct);
                Assert.Equal(sinceOn, holding.SinceOn);
                Assert.Equal(untilOn, holding.UntilOn);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).UntilOn)
        );

    private Task<RoleHolding> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.RoleHoldings.AsNoTracking().SingleAsync(row => row.Id == _roleHoldingId, ct);
}
