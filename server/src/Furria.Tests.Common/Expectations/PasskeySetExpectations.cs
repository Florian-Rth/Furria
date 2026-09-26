using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class PasskeySetExpectations
{
    private readonly Expected _expected;
    private readonly int _accountId;

    internal PasskeySetExpectations(Expected expected, int accountId)
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
                        .UserPasskeys.AsNoTracking()
                        .CountAsync(passkey => passkey.UserId == _accountId, ct)
                )
        );

    public Expected ToHold(byte[] credentialId, string name, DateTimeOffset addedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var passkey = await dbContext
                    .UserPasskeys.AsNoTracking()
                    .SingleOrDefaultAsync(
                        row => row.UserId == _accountId && row.CredentialId == credentialId,
                        ct
                    );

                Assert.NotNull(passkey);
                Assert.Equal(name, passkey.Data.Name);
                Assert.Equal(addedAt, passkey.Data.CreatedAt);
            }
        );
}
