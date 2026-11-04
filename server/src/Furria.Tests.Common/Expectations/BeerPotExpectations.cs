using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerPotExpectations
{
    private readonly Expected _expected;
    private readonly int _beerPotId;

    internal BeerPotExpectations(Expected expected, int beerPotId)
    {
        _expected = expected;
        _beerPotId = beerPotId;
    }

    public Expected ToBeOwnedBy(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).OwnerPersonId)
        );

    public Expected ToHaveSettings(int cratePriceCents, string? paymentLink, string? paymentNote) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var pot = await SingleAsync(dbContext, ct);
                Assert.Equal(cratePriceCents, pot.CratePriceCents);
                Assert.Equal(paymentLink, pot.PaymentLink);
                Assert.Equal(paymentNote, pot.PaymentNote);
            }
        );

    public Expected ToBeOpenedAt(DateTimeOffset openedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var pot = await SingleAsync(dbContext, ct);
                Assert.Equal(openedAt, pot.OpenedAt);
                Assert.Null(pot.ClosedAt);
            }
        );

    public Expected ToBeOpen() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).ClosedAt)
        );

    public Expected ToBeClosedAt(DateTimeOffset closedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(closedAt, (await SingleAsync(dbContext, ct)).ClosedAt)
        );

    private Task<BeerPot> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.BeerPots.AsNoTracking().SingleAsync(row => row.Id == _beerPotId, ct);
}
