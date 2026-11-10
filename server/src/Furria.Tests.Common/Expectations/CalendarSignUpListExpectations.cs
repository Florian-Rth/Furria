using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class CalendarSignUpListExpectations
{
    private readonly Expected _expected;
    private readonly int _signUpListId;

    internal CalendarSignUpListExpectations(Expected expected, int signUpListId)
    {
        _expected = expected;
        _signUpListId = signUpListId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .CalendarSignUpLists.AsNoTracking()
                        .AnyAsync(row => row.Id == _signUpListId, ct),
                    $"Expected no CalendarSignUpList with id {_signUpListId}."
                )
        );

    public Expected ToHaveLines(params (int PersonId, string? Text)[] lines) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    lines,
                    (
                        await dbContext
                            .CalendarSignUpLines.AsNoTracking()
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

    private Task<CalendarSignUpList> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext
            .CalendarSignUpLists.AsNoTracking()
            .SingleAsync(row => row.Id == _signUpListId, ct);
}
