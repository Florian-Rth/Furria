using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class SignUpListExpectations
{
    private readonly Expected _expected;
    private readonly int _signUpListId;

    internal SignUpListExpectations(Expected expected, int signUpListId)
    {
        _expected = expected;
        _signUpListId = signUpListId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .SignUpLists.AsNoTracking()
                        .AnyAsync(row => row.Id == _signUpListId, ct),
                    $"Expected no SignUpList with id {_signUpListId}."
                )
        );

    public Expected ToHaveLines(params (int PersonId, string? Text)[] lines) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    lines,
                    (
                        await dbContext
                            .SignUpLines.AsNoTracking()
                            .Where(line => line.SignUpListId == _signUpListId)
                            .OrderBy(line => line.CreatedAt)
                            .ThenBy(line => line.Id)
                            .Select(line => new { line.PersonId, line.Text })
                            .ToListAsync(ct)
                    ).Select(line => (line.PersonId, line.Text))
                )
        );

    public Expected ToHaveSettings(string title, string? hint, DateTimeOffset? signUpUntil) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var list = await SingleAsync(dbContext, ct);
                Assert.Equal((title, hint, signUpUntil), (list.Title, list.Hint, list.SignUpUntil));
            }
        );

    public Expected ToBeClosedByHand(bool isClosed) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(isClosed, (await SingleAsync(dbContext, ct)).ClosedAt is not null)
        );

    public Expected ToBeClosedAt(DateTimeOffset closedAt, int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var list = await SingleAsync(dbContext, ct);
                Assert.Equal(closedAt, list.ClosedAt);
                Assert.Equal(personId, list.ClosedByPersonId);
            }
        );

    public Expected ToBeClosedBy(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var list = await SingleAsync(dbContext, ct);
                Assert.NotNull(list.ClosedAt);
                Assert.Equal(personId, list.ClosedByPersonId);
            }
        );

    private Task<SignUpList> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.SignUpLists.AsNoTracking().SingleAsync(row => row.Id == _signUpListId, ct);
}
