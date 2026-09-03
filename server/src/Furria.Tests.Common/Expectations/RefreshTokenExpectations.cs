using Furria.Application.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class RefreshTokenExpectations
{
    private readonly Expected _expected;
    private readonly int _accountId;

    internal RefreshTokenExpectations(Expected expected, int accountId)
    {
        _expected = expected;
        _accountId = accountId;
    }

    public Expected ToHaveActiveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await Owned(dbContext).CountAsync(row => row.RevokedAt == null, ct)
                )
        );

    public Expected ToHaveRevokedCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await Owned(dbContext).CountAsync(row => row.RevokedAt != null, ct)
                )
        );

    public Expected ToHaveRevocationCount(RefreshTokenRevocationReason reason, int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await Owned(dbContext).CountAsync(row => row.RevokedReason == reason, ct)
                )
        );

    public Expected ToStoreNoRawSecret(string rawToken) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await Owned(dbContext).AnyAsync(row => row.TokenHash == rawToken, ct),
                    "A raw refresh token was found in the refresh_token table."
                )
        );

    private IQueryable<RefreshToken> Owned(AppDbContext dbContext) =>
        dbContext.RefreshTokens.AsNoTracking().Where(row => row.AccountId == _accountId);
}
