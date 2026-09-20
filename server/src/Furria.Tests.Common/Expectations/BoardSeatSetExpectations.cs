using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BoardSeatSetExpectations
{
    private readonly Expected _expected;
    private readonly int _boardOfficeId;

    internal BoardSeatSetExpectations(Expected expected, int boardOfficeId)
    {
        _expected = expected;
        _boardOfficeId = boardOfficeId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .BoardSeats.AsNoTracking()
                        .CountAsync(row => row.BoardOfficeId == _boardOfficeId, ct)
                )
        );

    public Expected ToHaveOpenCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .BoardSeats.AsNoTracking()
                        .CountAsync(
                            row => row.BoardOfficeId == _boardOfficeId && row.UntilOn == null,
                            ct
                        )
                )
        );
}
