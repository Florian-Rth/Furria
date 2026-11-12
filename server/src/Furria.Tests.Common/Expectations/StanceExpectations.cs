using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class StanceExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;
    private readonly int _statementId;

    internal StanceExpectations(Expected expected, int groupId, int statementId)
    {
        _expected = expected;
        _groupId = groupId;
        _statementId = statementId;
    }

    public Expected ToBe(StancePosition position, int importance) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var stance = await FindAsync(dbContext, ct);
                Assert.NotNull(stance);
                Assert.Equal(position, stance.Position);
                Assert.Equal(importance, stance.Importance);
            }
        );

    public Expected ToBeTakenAt(DateTimeOffset takenAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(takenAt, (await FindAsync(dbContext, ct))?.TakenAt)
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(async (dbContext, ct) => Assert.Null(await FindAsync(dbContext, ct)));

    private Task<Stance?> FindAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .Stances.AsNoTracking()
            .SingleOrDefaultAsync(
                stance => stance.GroupId == _groupId && stance.StatementId == _statementId,
                ct
            );
}
