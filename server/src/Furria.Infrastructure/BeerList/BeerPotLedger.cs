using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

internal static class BeerPotLedger
{
    internal static IQueryable<BeerPot> LockedPot(AppDbContext dbContext, int beerPotId) =>
        dbContext
            .BeerPots.FromSql($"SELECT * FROM beer_pot WHERE id = {beerPotId} FOR UPDATE")
            .AsNoTracking();

    internal static async Task<int> StockOfAsync(
        AppDbContext dbContext,
        int beerPotId,
        CancellationToken ct
    ) =>
        await dbContext
            .BeerStockMovements.AsNoTracking()
            .Where(movement => movement.BeerPotId == beerPotId)
            .SumAsync(movement => movement.Crates, ct)
        - await TakenCrates(dbContext).CountAsync(crate => crate.BeerPotId == beerPotId, ct);

    internal static IQueryable<BeerCrate> TakenCrates(AppDbContext dbContext) =>
        dbContext.BeerCrates.AsNoTracking().Where(crate => crate.UndoneAt == null);

    internal static IQueryable<BeerCrate> OpenCrates(AppDbContext dbContext) =>
        TakenCrates(dbContext).Where(crate => crate.PaidByPaymentId == null);
}
