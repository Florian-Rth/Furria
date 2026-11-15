using Furria.Application.BeerList;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

internal static class BeerPotLedger
{
    internal static IQueryable<BeerPot> LockedPot(AppDbContext dbContext, int beerPotId) =>
        dbContext
            .BeerPots.FromSql($"SELECT * FROM beer_pot WHERE id = {beerPotId} FOR UPDATE")
            .AsNoTracking();

    internal static IQueryable<BeerPotDrink> PotDrink(
        AppDbContext dbContext,
        int beerPotId,
        int beerDrinkId
    ) =>
        dbContext.BeerPotDrinks.Where(potDrink =>
            potDrink.BeerPotId == beerPotId && potDrink.BeerDrinkId == beerDrinkId
        );

    internal static async Task<int> StockOfAsync(
        AppDbContext dbContext,
        int beerPotId,
        int beerDrinkId,
        CancellationToken ct
    ) =>
        await StockMovements(dbContext)
            .Where(movement =>
                movement.BeerPotId == beerPotId && movement.BeerDrinkId == beerDrinkId
            )
            .SumAsync(movement => movement.Crates, ct)
        - await TakenCrates(dbContext)
            .CountAsync(
                crate => crate.BeerPotId == beerPotId && crate.BeerDrinkId == beerDrinkId,
                ct
            );

    internal static IQueryable<BeerStockMovement> StockMovements(AppDbContext dbContext) =>
        dbContext.BeerStockMovements.AsNoTracking();

    internal static IQueryable<BeerCrate> TakenCrates(AppDbContext dbContext) =>
        dbContext.BeerCrates.AsNoTracking().Where(crate => crate.UndoneAt == null);

    internal static IQueryable<BeerCrate> OpenCrates(AppDbContext dbContext) =>
        TakenCrates(dbContext).Where(crate => crate.PaidByPaymentId == null);

    internal static async Task<ILookup<int, BeerPaymentDrinkSummary>> SettledDrinksAsync(
        AppDbContext dbContext,
        int beerPotId,
        CancellationToken ct
    )
    {
        var settled = await dbContext
            .BeerCrates.AsNoTracking()
            .Where(crate => crate.BeerPotId == beerPotId && crate.PaidByPaymentId != null)
            .GroupBy(crate => new
            {
                BeerPaymentId = crate.PaidByPaymentId!.Value,
                crate.BeerDrinkId,
                crate.PotDrink!.Drink!.Name,
            })
            .OrderBy(drink => EF.Functions.Collate(drink.Key.Name, GermanCollation.Name))
            .ThenBy(drink => drink.Key.BeerDrinkId)
            .Select(drink => new SettledDrink(
                drink.Key.BeerPaymentId,
                new BeerPaymentDrinkSummary
                {
                    BeerDrinkId = drink.Key.BeerDrinkId,
                    Name = drink.Key.Name,
                    Crates = drink.Count(),
                }
            ))
            .ToListAsync(ct);
        return settled.ToLookup(drink => drink.BeerPaymentId, drink => drink.Summary);
    }

    private sealed record SettledDrink(int BeerPaymentId, BeerPaymentDrinkSummary Summary);
}
