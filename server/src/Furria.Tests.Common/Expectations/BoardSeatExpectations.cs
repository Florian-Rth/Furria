using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BoardSeatExpectations
{
    private readonly Expected _expected;
    private readonly int _boardSeatId;

    internal BoardSeatExpectations(Expected expected, int boardSeatId)
    {
        _expected = expected;
        _boardSeatId = boardSeatId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .BoardSeats.AsNoTracking()
                        .AnyAsync(row => row.Id == _boardSeatId, ct),
                    $"Expected no Vorstandssitz with id {_boardSeatId}."
                )
        );

    public Expected ToBeHeldBy(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).PersonId)
        );

    public Expected ToFillOffice(int boardOfficeId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(boardOfficeId, (await SingleAsync(dbContext, ct)).BoardOfficeId)
        );

    public Expected ToRunFrom(DateOnly sinceOn, DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var seat = await SingleAsync(dbContext, ct);
                Assert.Equal(sinceOn, seat.SinceOn);
                Assert.Equal(untilOn, seat.UntilOn);
            }
        );

    public Expected ToHavePeriod(DateOnly sinceOn, DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var seat = await SingleAsync(dbContext, ct);
                Assert.Equal(sinceOn, seat.SinceOn);
                Assert.Equal(untilOn, seat.UntilOn);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).UntilOn)
        );

    private Task<BoardSeat> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.BoardSeats.AsNoTracking().SingleAsync(row => row.Id == _boardSeatId, ct);
}
