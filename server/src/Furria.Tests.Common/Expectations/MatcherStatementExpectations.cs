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

    public Expected ToBeProposedBy(int groupId, string text) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var statement = await FindAsync(dbContext, ct);
                Assert.NotNull(statement);
                Assert.Equal(MatcherStatementStatus.Proposed, statement.Status);
                Assert.Equal(groupId, statement.ProposedByGroupId);
                Assert.Equal(text, statement.Text);
                Assert.Null(statement.SortOrder);
            }
        );

    public Expected ToBeApprovedAs(string text, int sortOrder) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var statement = await FindAsync(dbContext, ct);
                Assert.NotNull(statement);
                Assert.Equal(MatcherStatementStatus.Approved, statement.Status);
                Assert.Equal(text, statement.Text);
                Assert.Equal(sortOrder, statement.SortOrder);
            }
        );

    public Expected ToBeRewordedAt(DateTimeOffset? rewordedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(rewordedAt, (await FindAsync(dbContext, ct))?.RewordedAt)
        );

    public Expected ToHaveStatus(MatcherStatementStatus status) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(status, (await FindAsync(dbContext, ct))?.Status)
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(async (dbContext, ct) => Assert.Null(await FindAsync(dbContext, ct)));

    private Task<MatcherStatement?> FindAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .MatcherStatements.AsNoTracking()
            .SingleOrDefaultAsync(statement => statement.Id == _statementId, ct);
}
