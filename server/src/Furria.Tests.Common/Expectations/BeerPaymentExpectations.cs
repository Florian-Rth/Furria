using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerPaymentExpectations
{
    private readonly Expected _expected;
    private readonly int _beerPaymentId;

    internal BeerPaymentExpectations(Expected expected, int beerPaymentId)
    {
        _expected = expected;
        _beerPaymentId = beerPaymentId;
    }

    public Expected ToSettle(
        int crates,
        int amountCents,
        int? bookedByPersonId,
        DateTimeOffset bookedAt
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var payment = await dbContext
                    .BeerPayments.AsNoTracking()
                    .SingleAsync(row => row.Id == _beerPaymentId, ct);
                Assert.Equal(crates, payment.Crates);
                Assert.Equal(amountCents, payment.AmountCents);
                Assert.Equal(bookedByPersonId, payment.BookedByPersonId);
                Assert.Equal(bookedAt, payment.BookedAt);
                Assert.Null(payment.UndoneAt);
                Assert.Equal(
                    crates,
                    await dbContext
                        .BeerCrates.AsNoTracking()
                        .CountAsync(crate => crate.PaidByPaymentId == _beerPaymentId, ct)
                );
            }
        );

    public Expected ToBeUndone(DateTimeOffset undoneAt, int? undoneByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var payment = await dbContext
                    .BeerPayments.AsNoTracking()
                    .SingleAsync(row => row.Id == _beerPaymentId, ct);
                Assert.Equal(undoneAt, payment.UndoneAt);
                Assert.Equal(undoneByPersonId, payment.UndoneByPersonId);
                Assert.False(
                    await dbContext
                        .BeerCrates.AsNoTracking()
                        .AnyAsync(crate => crate.PaidByPaymentId == _beerPaymentId, ct)
                );
            }
        );
}
