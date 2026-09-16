using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AccountSetExpectations
{
    private readonly Expected _expected;

    internal AccountSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToContainEmail(string email) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext
                        .Users.AsNoTracking()
                        .AnyAsync(account => account.Email == email, ct),
                    $"No Account with the email {email} exists."
                )
        );

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.Users.AsNoTracking().CountAsync(ct))
        );
}
