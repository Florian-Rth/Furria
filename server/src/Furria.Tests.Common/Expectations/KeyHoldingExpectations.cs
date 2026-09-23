using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class KeyHoldingExpectations
{
    private readonly Expected _expected;
    private readonly int _keyHoldingId;

    internal KeyHoldingExpectations(Expected expected, int keyHoldingId)
    {
        _expected = expected;
        _keyHoldingId = keyHoldingId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .KeyHoldings.AsNoTracking()
                        .AnyAsync(row => row.Id == _keyHoldingId, ct),
                    $"Expected no KeyHolding with id {_keyHoldingId}."
                )
        );

    public Expected ToBeHeldAt(int venueId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(venueId, (await SingleAsync(dbContext, ct)).VenueId)
        );

    public Expected ToBeHeldBy(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).PersonId)
        );

    public Expected ToHaveSinceOn(DateOnly sinceOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(sinceOn, (await SingleAsync(dbContext, ct)).SinceOn)
        );

    public Expected ToHaveUntilOn(DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(untilOn, (await SingleAsync(dbContext, ct)).UntilOn)
        );

    public Expected ToHavePeriod(DateOnly sinceOn, DateOnly? untilOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var holding = await SingleAsync(dbContext, ct);
                Assert.Equal(sinceOn, holding.SinceOn);
                Assert.Equal(untilOn, holding.UntilOn);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).UntilOn)
        );

    private Task<KeyHolding> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.KeyHoldings.AsNoTracking().SingleAsync(row => row.Id == _keyHoldingId, ct);
}
