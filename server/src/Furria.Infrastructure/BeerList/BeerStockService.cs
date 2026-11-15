using System.Data;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerStockService
{
    private const string ClosedPotMessage =
        "Diese Bierliste ist übergeben, ihr Bestand lässt sich nicht mehr ändern.";
    private const string BelowZeroMessage =
        "So viele Kisten sind nicht mehr da. Der Bestand fällt nie unter null.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BeerStockService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public Task<Result> BookDeliveryAsync(BeerDeliveryCommand command, CancellationToken ct) =>
        BookAsync(
            new StockChange(
                command.BeerPotId,
                command.BeerDrinkId,
                BeerStockMovementKind.Delivery,
                command.Crates,
                command.BookedByPersonId
            ),
            ct
        );

    public Task<Result> BookCorrectionAsync(
        BeerStockCorrectionCommand command,
        CancellationToken ct
    ) =>
        BookAsync(
            new StockChange(
                command.BeerPotId,
                command.BeerDrinkId,
                BeerStockMovementKind.Correction,
                command.Crates,
                command.BookedByPersonId
            ),
            ct
        );

    public async Task<Result<BeerStockDetails>> GetStockAsync(int beerPotId, CancellationToken ct)
    {
        var isOpen = await IsOpenAsync(_dbContext.BeerPots.AsNoTracking(), beerPotId, ct);
        if (isOpen is null)
            return Result<BeerStockDetails>.NotFound(BeerListMessages.UnknownPot);

        await using var snapshot = await _dbContext.Database.BeginTransactionAsync(
            IsolationLevel.RepeatableRead,
            ct
        );
        var drinks = await DrinkStocksAsync(beerPotId, ct);
        var movements = await MovementsOfAsync(beerPotId, ct);
        await snapshot.CommitAsync(ct);

        return Result<BeerStockDetails>.Success(
            new BeerStockDetails
            {
                Drinks = [.. drinks.Select(drink => StockOf(drink, isOpen.Value))],
                Movements = movements,
            }
        );
    }

    private static Task<bool?> IsOpenAsync(
        IQueryable<BeerPot> pots,
        int beerPotId,
        CancellationToken ct
    ) =>
        pots.Where(pot => pot.Id == beerPotId)
            .Select(pot => (bool?)(pot.ClosedAt == null))
            .SingleOrDefaultAsync(ct);

    private BeerDrinkStockSummary StockOf(DrinkStockRow drink, bool potIsOpen) =>
        new()
        {
            BeerDrinkId = drink.BeerDrinkId,
            Name = drink.Name,
            CratePriceCents = drink.CratePriceCents,
            IsDefault = drink.IsDefault,
            IsRetired = drink.IsRetired,
            Crates = drink.Crates,
            Forecast = new BeerStockProjection
            {
                PaceWindowDays = BeerStockForecast.PaceWindowDays,
                CratesTakenInPaceWindow = drink.CratesTakenInPaceWindow,
                ProjectedEmptyOn =
                    potIsOpen && !drink.IsRetired
                        ? BeerStockForecast.ProjectedEmptyOn(
                            drink.Crates,
                            drink.CratesTakenInPaceWindow,
                            ClubClock.Today(_timeProvider)
                        )
                        : null,
            },
        };

    private async Task<IReadOnlyList<DrinkStockRow>> DrinkStocksAsync(
        int beerPotId,
        CancellationToken ct
    )
    {
        var stockMovements = BeerPotLedger.StockMovements(_dbContext);
        var takenCrates = BeerPotLedger.TakenCrates(_dbContext);
        var paceWindowStart =
            _timeProvider.GetUtcNow() - TimeSpan.FromDays(BeerStockForecast.PaceWindowDays);

        return await _dbContext
            .BeerPotDrinks.AsNoTracking()
            .Where(potDrink => potDrink.BeerPotId == beerPotId)
            .OrderBy(potDrink => potDrink.RetiredAt != null)
            .ThenBy(potDrink => EF.Functions.Collate(potDrink.Drink!.Name, GermanCollation.Name))
            .ThenBy(potDrink => potDrink.BeerDrinkId)
            .Select(potDrink => new DrinkStockRow(
                potDrink.BeerDrinkId,
                potDrink.Drink!.Name,
                potDrink.CratePriceCents,
                potDrink.IsDefault,
                potDrink.RetiredAt != null,
                stockMovements
                    .Where(movement =>
                        movement.BeerPotId == beerPotId
                        && movement.BeerDrinkId == potDrink.BeerDrinkId
                    )
                    .Sum(movement => movement.Crates)
                    - takenCrates.Count(crate =>
                        crate.BeerPotId == beerPotId && crate.BeerDrinkId == potDrink.BeerDrinkId
                    ),
                takenCrates.Count(crate =>
                    crate.BeerDrinkId == potDrink.BeerDrinkId && crate.BookedAt > paceWindowStart
                )
            ))
            .ToListAsync(ct);
    }

    private async Task<IReadOnlyList<BeerStockMovementSummary>> MovementsOfAsync(
        int beerPotId,
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerStockMovements.AsNoTracking()
            .Where(movement => movement.BeerPotId == beerPotId)
            .OrderByDescending(movement => movement.BookedAt)
            .ThenByDescending(movement => movement.Id)
            .Select(movement => new BeerStockMovementSummary
            {
                MovementId = movement.Id,
                Kind = movement.Kind,
                BeerDrinkId = movement.BeerDrinkId,
                DrinkName = movement.PotDrink!.Drink!.Name,
                Crates = movement.Crates,
                BookedAt = movement.BookedAt,
                BookedBy =
                    movement.BookedBy == null
                        ? null
                        : new BeerListPerson
                        {
                            PersonId = movement.BookedBy.Id,
                            FirstName = movement.BookedBy.FirstName,
                            LastName = movement.BookedBy.LastName,
                        },
            })
            .ToListAsync(ct);

    private async Task<Result> BookAsync(StockChange change, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var isOpen = await IsOpenAsync(
            BeerPotLedger.LockedPot(_dbContext, change.BeerPotId),
            change.BeerPotId,
            ct
        );
        if (isOpen is null)
            return Result.NotFound(BeerListMessages.UnknownPot);

        if (!isOpen.Value)
            return Result.Conflict(ClosedPotMessage);

        var drinkCheck = await DrinkCheckAsync(change, ct);
        if (!drinkCheck.IsSuccess)
            return drinkCheck;

        var stock = await BeerPotLedger.StockOfAsync(
            _dbContext,
            change.BeerPotId,
            change.BeerDrinkId,
            ct
        );
        if (stock + change.Crates < 0)
            return Result.Conflict(BelowZeroMessage);

        _dbContext.BeerStockMovements.Add(
            new BeerStockMovement
            {
                BeerPotId = change.BeerPotId,
                BeerDrinkId = change.BeerDrinkId,
                Kind = change.Kind,
                Crates = change.Crates,
                BookedByPersonId = change.BookedByPersonId,
                BookedAt = _timeProvider.GetUtcNow(),
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<Result> DrinkCheckAsync(StockChange change, CancellationToken ct)
    {
        var isRetired = await BeerPotLedger
            .PotDrink(_dbContext, change.BeerPotId, change.BeerDrinkId)
            .AsNoTracking()
            .Select(potDrink => (bool?)(potDrink.RetiredAt != null))
            .SingleOrDefaultAsync(ct);

        return isRetired switch
        {
            null => Result.NotFound(BeerListMessages.UnknownDrink),
            true when change.Kind == BeerStockMovementKind.Delivery => Result.Conflict(
                BeerListMessages.RetiredDrink
            ),
            _ => Result.Success(),
        };
    }

    private sealed record StockChange(
        int BeerPotId,
        int BeerDrinkId,
        BeerStockMovementKind Kind,
        int Crates,
        int? BookedByPersonId
    );

    private sealed record DrinkStockRow(
        int BeerDrinkId,
        string Name,
        int CratePriceCents,
        bool IsDefault,
        bool IsRetired,
        int Crates,
        int CratesTakenInPaceWindow
    );
}
