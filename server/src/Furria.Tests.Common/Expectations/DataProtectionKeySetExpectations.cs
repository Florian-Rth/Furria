using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class DataProtectionKeySetExpectations
{
    private readonly Expected _expected;

    internal DataProtectionKeySetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHoldAKey() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext.DataProtectionKeys.AsNoTracking().AnyAsync(ct),
                    "No data-protection key is stored in the database."
                )
        );
}
