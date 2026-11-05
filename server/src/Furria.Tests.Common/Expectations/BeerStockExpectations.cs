using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerStockExpectations
{
    private readonly Expected _expected;
    private readonly int _beerPotId;

    internal BeerStockExpectations(Expected expected, int beerPotId)
    {
        _expected = expected;
        _beerPotId = beerPotId;
    }

    public Expected ToHaveMovementCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .BeerStockMovements.AsNoTracking()
                        .CountAsync(movement => movement.BeerPotId == _beerPotId, ct)
                )
        );

    public Expected ToStandAt(int crates) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var movedIn = await dbContext
                    .BeerStockMovements.AsNoTracking()
                    .Where(movement => movement.BeerPotId == _beerPotId)
                    .SumAsync(movement => movement.Crates, ct);
                var taken = await dbContext
                    .BeerCrates.AsNoTracking()
                    .CountAsync(
                        crate => crate.BeerPotId == _beerPotId && crate.UndoneAt == null,
                        ct
                    );
                Assert.Equal(crates, movedIn - taken);
            }
        );

    public Expected ToEndWith(
        BeerStockMovementKind kind,
        int crates,
        int? bookedByPersonId,
        DateTimeOffset bookedAt
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var latest = await dbContext
                    .BeerStockMovements.AsNoTracking()
                    .Where(movement => movement.BeerPotId == _beerPotId)
                    .OrderByDescending(movement => movement.Id)
                    .FirstAsync(ct);
                Assert.Equal(kind, latest.Kind);
                Assert.Equal(crates, latest.Crates);
                Assert.Equal(bookedByPersonId, latest.BookedByPersonId);
                Assert.Equal(bookedAt, latest.BookedAt);
            }
        );
}
