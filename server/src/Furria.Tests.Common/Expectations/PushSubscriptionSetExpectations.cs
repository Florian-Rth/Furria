using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PushSubscriptionSetExpectations
{
    private readonly Expected _expected;
    private readonly int _accountId;

    internal PushSubscriptionSetExpectations(Expected expected, int accountId)
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
                        .PushSubscriptions.AsNoTracking()
                        .CountAsync(subscription => subscription.AccountId == _accountId, ct)
                )
        );

    public Expected ToHold(string endpoint, string publicKey, string authSecret) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var subscription = await dbContext
                    .PushSubscriptions.AsNoTracking()
                    .SingleOrDefaultAsync(
                        row => row.AccountId == _accountId && row.Endpoint == endpoint,
                        ct
                    );

                Assert.NotNull(subscription);
                Assert.Equal(publicKey, subscription.PublicKey);
                Assert.Equal(authSecret, subscription.AuthSecret);
            }
        );

    public Expected ToNotHold(string endpoint) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .PushSubscriptions.AsNoTracking()
                        .AnyAsync(
                            row => row.AccountId == _accountId && row.Endpoint == endpoint,
                            ct
                        )
                )
        );
}
