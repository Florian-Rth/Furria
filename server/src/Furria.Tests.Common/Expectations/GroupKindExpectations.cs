using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupKindExpectations
{
    private readonly Expected _expected;
    private readonly int _groupKindId;

    internal GroupKindExpectations(Expected expected, int groupKindId)
    {
        _expected = expected;
        _groupKindId = groupKindId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .GroupKinds.AsNoTracking()
                        .AnyAsync(row => row.Id == _groupKindId, ct),
                    $"Expected no Gruppenart with id {_groupKindId}."
                )
        );

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    private Task<GroupKind> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.GroupKinds.AsNoTracking().SingleAsync(row => row.Id == _groupKindId, ct);
}
