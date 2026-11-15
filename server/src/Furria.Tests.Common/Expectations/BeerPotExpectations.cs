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

    public Expected ToHavePaymentLink(string? paymentLink) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(paymentLink, (await SingleAsync(dbContext, ct)).PaymentLink)
        );

    public Expected ToListDrinks(params (string Name, int CratePriceCents)[] drinks) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var listed = await dbContext
                    .BeerPotDrinks.AsNoTracking()
                    .Where(potDrink =>
                        potDrink.BeerPotId == _beerPotId && potDrink.RetiredAt == null
                    )
                    .Select(potDrink => new { potDrink.Drink!.Name, potDrink.CratePriceCents })
                    .ToListAsync(ct);
                Assert.Equal(
                    drinks.OrderBy(drink => drink.Name, StringComparer.Ordinal),
                    listed
                        .Select(drink => (drink.Name, drink.CratePriceCents))
                        .OrderBy(drink => drink.Name, StringComparer.Ordinal)
                );
            }
        );

    public Expected ToHaveWarnedOf(string drink, DateTimeOffset? stockWarningSentAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    stockWarningSentAt,
                    await dbContext
                        .BeerPotDrinks.AsNoTracking()
                        .Where(potDrink =>
                            potDrink.BeerPotId == _beerPotId && potDrink.Drink!.Name == drink
                        )
                        .Select(potDrink => potDrink.StockWarningSentAt)
                        .SingleAsync(ct)
                )
        );

    public Expected ToHaveDefaultDrink(string? drink) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    drink is null ? Array.Empty<string>() : [drink],
                    await dbContext
                        .BeerPotDrinks.AsNoTracking()
                        .Where(potDrink => potDrink.BeerPotId == _beerPotId && potDrink.IsDefault)
                        .Select(potDrink => potDrink.Drink!.Name)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveRetired(int beerDrinkId, DateTimeOffset retiredAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    retiredAt,
                    await dbContext
                        .BeerPotDrinks.AsNoTracking()
                        .Where(potDrink =>
                            potDrink.BeerPotId == _beerPotId && potDrink.BeerDrinkId == beerDrinkId
                        )
                        .Select(potDrink => potDrink.RetiredAt)
                        .SingleAsync(ct)
                )
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
