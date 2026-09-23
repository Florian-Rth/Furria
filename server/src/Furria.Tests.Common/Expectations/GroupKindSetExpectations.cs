using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupKindSetExpectations
{
    private readonly Expected _expected;

    internal GroupKindSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToReadInNameOrder(params string[] names) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    names,
                    await dbContext
                        .GroupKinds.AsNoTracking()
                        .Where(kind => names.Contains(kind.Name))
                        .OrderBy(kind => EF.Functions.Collate(kind.Name, GermanCollation.Name))
                        .ThenBy(kind => kind.Id)
                        .Select(kind => kind.Name)
                        .ToListAsync(ct)
                )
        );

    public Expected ToCountGroupsOf(int groupKindId, int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .Groups.AsNoTracking()
                        .CountAsync(
                            group => group.GroupKindId == groupKindId && group.ArchivedOn == null,
                            ct
                        )
                )
        );
}
