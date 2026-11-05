using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerCrateExpectations
{
    private readonly Expected _expected;
    private readonly int _beerCrateId;

    internal BeerCrateExpectations(Expected expected, int beerCrateId)
    {
        _expected = expected;
        _beerCrateId = beerCrateId;
    }

    public Expected ToBeTaken() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var crate = await dbContext
                    .BeerCrates.AsNoTracking()
                    .SingleAsync(row => row.Id == _beerCrateId, ct);
                Assert.Null(crate.UndoneAt);
                Assert.Null(crate.UndoneByPersonId);
            }
        );

    public Expected ToBeUndone(DateTimeOffset undoneAt, int? undoneByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var crate = await dbContext
                    .BeerCrates.AsNoTracking()
                    .SingleAsync(row => row.Id == _beerCrateId, ct);
                Assert.Equal(undoneAt, crate.UndoneAt);
                Assert.Equal(undoneByPersonId, crate.UndoneByPersonId);
            }
        );

    public Expected ToBePaidBy(int? beerPaymentId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    beerPaymentId,
                    await dbContext
                        .BeerCrates.AsNoTracking()
                        .Where(row => row.Id == _beerCrateId)
                        .Select(row => row.PaidByPaymentId)
                        .SingleAsync(ct)
                )
        );
}
