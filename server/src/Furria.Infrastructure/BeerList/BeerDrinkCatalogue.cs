using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

internal static class BeerDrinkCatalogue
{
    internal static async Task<BeerDrink> DrinkNamedAsync(
        AppDbContext dbContext,
        string name,
        CancellationToken ct
    ) =>
        await NamedAsync(dbContext, name, ct)
        ?? dbContext.BeerDrinks.Add(new BeerDrink { Name = name }).Entity;

    internal static Task<bool> IsNameTakenAsync(
        AppDbContext dbContext,
        string name,
        int exceptBeerDrinkId,
        CancellationToken ct
    )
    {
        var lowered = name.ToLowerInvariant();

        return dbContext
            .BeerDrinks.AsNoTracking()
            .AnyAsync(
                drink => drink.Id != exceptBeerDrinkId && drink.Name.ToLower() == lowered,
                ct
            );
    }

    private static Task<BeerDrink?> NamedAsync(
        AppDbContext dbContext,
        string name,
        CancellationToken ct
    )
    {
        var lowered = name.ToLowerInvariant();

        return dbContext.BeerDrinks.SingleOrDefaultAsync(
            drink => drink.Name.ToLower() == lowered,
            ct
        );
    }
}
