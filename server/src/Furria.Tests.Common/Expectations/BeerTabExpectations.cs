using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class BeerTabExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal BeerTabExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToHaveTakenCrates(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .BeerCrates.AsNoTracking()
                        .CountAsync(
                            crate => crate.PersonId == _personId && crate.UndoneAt == null,
                            ct
                        )
                )
        );

    public Expected ToEndWithCratesOf(
        int count,
        int beerPotId,
        int priceCents,
        int? enteredByPersonId,
        DateTimeOffset bookedAt
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var latest = await dbContext
                    .BeerCrates.AsNoTracking()
                    .Where(crate => crate.PersonId == _personId && crate.UndoneAt == null)
                    .OrderByDescending(crate => crate.Id)
                    .Take(count)
                    .ToListAsync(ct);
                Assert.Equal(count, latest.Count);
                Assert.All(
                    latest,
                    crate =>
                    {
                        Assert.Equal(beerPotId, crate.BeerPotId);
                        Assert.Equal(priceCents, crate.PriceCents);
                        Assert.Equal(enteredByPersonId, crate.EnteredByPersonId);
                        Assert.Equal(bookedAt, crate.BookedAt);
                        Assert.Null(crate.PaidByPaymentId);
                    }
                );
            }
        );
}
