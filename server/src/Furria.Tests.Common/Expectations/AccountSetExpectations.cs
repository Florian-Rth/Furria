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

    public Expected ToHoldOneManagingLoginAt(string email) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var managingLogin = await dbContext
                    .Users.AsNoTracking()
                    .SingleAsync(account => account.IsManagingLogin, ct);

                Assert.Equal(email, managingLogin.Email);
                Assert.Null(managingLogin.PersonId);
            }
        );

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.Users.AsNoTracking().CountAsync(ct))
        );
}
