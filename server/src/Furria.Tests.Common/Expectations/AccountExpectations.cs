using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AccountExpectations
{
    private readonly Expected _expected;
    private readonly int _accountId;

    internal AccountExpectations(Expected expected, int accountId)
    {
        _expected = expected;
        _accountId = accountId;
    }

    public Expected ToExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext.Users.AsNoTracking().AnyAsync(row => row.Id == _accountId, ct),
                    $"Expected an Account with id {_accountId}."
                )
        );

    public Expected ToHaveEmail(string email) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var account = await dbContext
                    .Users.AsNoTracking()
                    .SingleAsync(row => row.Id == _accountId, ct);

                Assert.Equal(email, account.Email);
            }
        );

    public Expected ToBeLinkedTo(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var account = await dbContext
                    .Users.AsNoTracking()
                    .SingleAsync(row => row.Id == _accountId, ct);

                Assert.Equal(personId, account.PersonId);
            }
        );

    public Expected ToBeDisabled(bool disabled) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var account = await dbContext
                    .Users.AsNoTracking()
                    .SingleAsync(row => row.Id == _accountId, ct);

                Assert.Equal(disabled, account.IsDisabled);
            }
        );
}
