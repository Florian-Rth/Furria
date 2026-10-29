using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class ActExpectations
{
    private readonly Expected _expected;
    private readonly int _actId;

    internal ActExpectations(Expected expected, int actId)
    {
        _expected = expected;
        _actId = actId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToBelongTo(int? groupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(groupId, (await SingleAsync(dbContext, ct)).GroupId)
        );

    public Expected ToBeArchivedAt(DateTimeOffset archivedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedAt, (await SingleAsync(dbContext, ct)).ArchivedAt)
        );

    public Expected ToBeInUse() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ArchivedAt)
        );

    public Expected ToChangeTheCastExactly(params (int PersonId, CastChange Change)[] changes) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    changes.OrderBy(change => change.PersonId),
                    (
                        await dbContext
                            .ActCastChanges.AsNoTracking()
                            .Where(row => row.ActId == _actId)
                            .OrderBy(row => row.PersonId)
                            .ToListAsync(ct)
                    ).Select(row => (row.PersonId, row.Change))
                )
        );

    public Expected ToWishExactly(
        params (RunningOrderRuleKind Kind, RuleStrength Strength)[] wishes
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    wishes.OrderBy(wish => wish.Kind),
                    (
                        await dbContext
                            .ActWishes.AsNoTracking()
                            .Where(row => row.ActId == _actId)
                            .ToListAsync(ct)
                    )
                        .OrderBy(row => row.Kind)
                        .Select(row => (row.Kind, row.Strength))
                )
        );

    private Task<Act> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Acts.AsNoTracking().SingleAsync(row => row.Id == _actId, ct);
}
