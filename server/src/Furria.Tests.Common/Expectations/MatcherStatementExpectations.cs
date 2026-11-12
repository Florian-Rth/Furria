using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MatcherStatementExpectations
{
    private readonly Expected _expected;
    private readonly int _statementId;

    internal MatcherStatementExpectations(Expected expected, int statementId)
    {
        _expected = expected;
        _statementId = statementId;
    }

    public Expected ToBeInPoolAs(string text, int sortOrder) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var statement = await FindAsync(dbContext, ct);
                Assert.NotNull(statement);
                Assert.Equal(text, statement.Text);
                Assert.Equal(sortOrder, statement.SortOrder);
            }
        );

    public Expected ToBeRewordedAt(DateTimeOffset? rewordedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(rewordedAt, (await FindAsync(dbContext, ct))?.RewordedAt)
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(async (dbContext, ct) => Assert.Null(await FindAsync(dbContext, ct)));

    private Task<MatcherStatement?> FindAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .MatcherStatements.AsNoTracking()
            .SingleOrDefaultAsync(statement => statement.Id == _statementId, ct);
}
