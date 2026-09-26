using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class EmailConfirmationSetExpectations
{
    private readonly Expected _expected;
    private readonly int _accountId;

    internal EmailConfirmationSetExpectations(Expected expected, int accountId)
    {
        _expected = expected;
        _accountId = accountId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .EmailConfirmations.AsNoTracking()
                        .CountAsync(confirmation => confirmation.AccountId == _accountId, ct)
                )
        );

    public Expected ToHaveLiveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .EmailConfirmations.AsNoTracking()
                        .CountAsync(
                            confirmation =>
                                confirmation.AccountId == _accountId
                                && confirmation.ConsumedAt == null
                                && confirmation.VoidedAt == null,
                            ct
                        )
                )
        );
}
