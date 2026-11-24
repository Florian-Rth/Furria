using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal GroupExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToHaveDescription(string description) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(description, (await SingleAsync(dbContext, ct)).Description)
        );

    public Expected ToHaveGroupKind(int? groupKindId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(groupKindId, (await SingleAsync(dbContext, ct)).GroupKindId)
        );

    public Expected ToHaveFoundedYear(int? foundedYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(foundedYear, (await SingleAsync(dbContext, ct)).FoundedYear)
        );

    public Expected ToHaveJoinedTheGroupMatcherAt(DateTimeOffset? joinedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(joinedAt, (await SingleAsync(dbContext, ct)).GroupMatcherJoinedAt)
        );

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    private Task<Group> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Groups.AsNoTracking().SingleAsync(row => row.Id == _groupId, ct);
}
