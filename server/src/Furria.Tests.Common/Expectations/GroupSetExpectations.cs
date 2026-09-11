using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupSetExpectations
{
    private const string GermanCollation = "de-DE-x-icu";

    private readonly Expected _expected;

    internal GroupSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToReadInGermanOrder(params string[] names) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    names,
                    await dbContext
                        .Groups.AsNoTracking()
                        .Where(group => names.Contains(group.Name))
                        .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation))
                        .ThenBy(group => group.Id)
                        .Select(group => group.Name)
                        .ToListAsync(ct)
                )
        );
}
