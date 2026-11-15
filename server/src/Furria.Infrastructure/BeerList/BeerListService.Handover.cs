using System.Diagnostics.Contracts;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed partial class BeerListService
{
    private const string PotToHandOverMessage = "Diese Bierliste ist schon übergeben.";
    private const string SuccessorOwnsPotMessage = "Diese Bierliste gehört schon dieser Person.";
    private const string UnpricedDrinksMessage =
        "Jedes Getränk der Bierliste braucht genau einen neuen Preis.";

    public async Task<Result<BeerPotHandoverDetails>> HandOverAsync(
        BeerPotHandoverCommand command,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pot = await BeerPotLedger
            .LockedPot(_dbContext, command.BeerPotId)
            .Select(row => new PotToHandOver(row.Id, row.OwnerPersonId, row.ClosedAt))
            .SingleOrDefaultAsync(ct);
        if (pot is null)
            return Result<BeerPotHandoverDetails>.NotFound(BeerListMessages.UnknownPot);

        if (pot.ClosedAt is not null)
            return Result<BeerPotHandoverDetails>.Conflict(PotToHandOverMessage);

        if (!await PersonExistsAsync(command.SuccessorPersonId, ct))
            return Result<BeerPotHandoverDetails>.NotFound(UnknownPersonMessage);

        if (!await MayManageAsync(command.SuccessorPersonId, ct))
            return Result<BeerPotHandoverDetails>.Validation(OwnerWithoutRightMessage);

        if (pot.OwnerPersonId == command.SuccessorPersonId)
            return Result<BeerPotHandoverDetails>.Validation(SuccessorOwnsPotMessage);

        var drinks = await DrinksToCarryAsync(pot.Id, ct);
        if (!PricesEveryDrink(command.CarriedDrinkPrices, drinks))
            return Result<BeerPotHandoverDetails>.Validation(UnpricedDrinksMessage);

        var handover = await HandOverLockedAsync(pot, drinks, command, ct);
        if (!handover.IsSuccess)
            return handover;

        await transaction.CommitAsync(ct);
        return handover;
    }

    [Pure]
    private static bool PricesEveryDrink(
        IReadOnlyList<BeerDrinkPrice> prices,
        IReadOnlyList<DrinkToCarry> drinks
    ) =>
        prices.Count == drinks.Count
        && prices
            .Select(price => price.BeerDrinkId)
            .ToHashSet()
            .SetEquals(drinks.Select(drink => drink.BeerDrinkId));

    private async Task<Result<BeerPotHandoverDetails>> HandOverLockedAsync(
        PotToHandOver pot,
        IReadOnlyList<DrinkToCarry> drinks,
        BeerPotHandoverCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var successorPot = new BeerPot
        {
            OwnerPersonId = command.SuccessorPersonId,
            PaymentLink = command.SuccessorPaymentLink,
            OpenedAt = now,
        };
        var prices = command.CarriedDrinkPrices.ToDictionary(
            price => price.BeerDrinkId,
            price => price.CratePriceCents
        );

        await CloseAsync(pot.Id, now, ct);
        _dbContext.BeerPots.Add(successorPot);
        foreach (var drink in drinks)
        {
            _dbContext.BeerPotDrinks.Add(
                new BeerPotDrink
                {
                    Pot = successorPot,
                    BeerDrinkId = drink.BeerDrinkId,
                    CratePriceCents = prices[drink.BeerDrinkId],
                    IsDefault = drink.IsDefault,
                    StockWarningSentAt = drink.CarriedStockWarningSentAt,
                }
            );
            if (drink.CratesLeft > 0)
                _dbContext.BeerStockMovements.AddRange(
                    CarryMovements(pot.Id, successorPot, drink, command.HandedOverByPersonId, now)
                );
        }

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        return saved.IsSuccess
            ? Result<BeerPotHandoverDetails>.Success(
                new BeerPotHandoverDetails
                {
                    SuccessorBeerPotId = successorPot.Id,
                    CarriedCrates = drinks.Sum(drink => Math.Max(drink.CratesLeft, 0)),
                }
            )
            : Result<BeerPotHandoverDetails>.Carrying(saved);
    }

    [Pure]
    private static BeerStockMovement[] CarryMovements(
        int handedOverPotId,
        BeerPot successorPot,
        DrinkToCarry drink,
        int? bookedByPersonId,
        DateTimeOffset bookedAt
    ) =>
        [
            new()
            {
                BeerPotId = handedOverPotId,
                BeerDrinkId = drink.BeerDrinkId,
                Kind = BeerStockMovementKind.HandedOver,
                Crates = -drink.CratesLeft,
                BookedByPersonId = bookedByPersonId,
                BookedAt = bookedAt,
            },
            new()
            {
                Pot = successorPot,
                BeerDrinkId = drink.BeerDrinkId,
                Kind = BeerStockMovementKind.HandoverCarry,
                Crates = drink.CratesLeft,
                BookedByPersonId = bookedByPersonId,
                BookedAt = bookedAt,
            },
        ];

    private Task CloseAsync(int beerPotId, DateTimeOffset closedAt, CancellationToken ct) =>
        _dbContext
            .BeerPots.Where(row => row.Id == beerPotId)
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(closed => closed.ClosedAt, closedAt)
                        .SetProperty(closed => closed.UpdatedAt, closedAt),
                ct
            );

    private async Task<IReadOnlyList<DrinkToCarry>> DrinksToCarryAsync(
        int beerPotId,
        CancellationToken ct
    )
    {
        var stockMovements = BeerPotLedger.StockMovements(_dbContext);
        var takenCrates = BeerPotLedger.TakenCrates(_dbContext);

        return await _dbContext
            .BeerPotDrinks.AsNoTracking()
            .Where(potDrink => potDrink.BeerPotId == beerPotId && potDrink.RetiredAt == null)
            .OrderBy(potDrink => potDrink.BeerDrinkId)
            .Select(potDrink => new DrinkToCarry(
                potDrink.BeerDrinkId,
                potDrink.IsDefault,
                stockMovements
                    .Where(movement =>
                        movement.BeerPotId == beerPotId
                        && movement.BeerDrinkId == potDrink.BeerDrinkId
                    )
                    .Sum(movement => movement.Crates)
                    - takenCrates.Count(crate =>
                        crate.BeerPotId == beerPotId && crate.BeerDrinkId == potDrink.BeerDrinkId
                    ),
                stockMovements.Any(movement =>
                    movement.BeerPotId == beerPotId
                    && movement.BeerDrinkId == potDrink.BeerDrinkId
                    && movement.Kind == BeerStockMovementKind.Delivery
                    && movement.BookedAt > potDrink.StockWarningSentAt
                )
                    ? null
                    : potDrink.StockWarningSentAt
            ))
            .ToListAsync(ct);
    }

    private sealed record PotToHandOver(int Id, int? OwnerPersonId, DateTimeOffset? ClosedAt);

    private sealed record DrinkToCarry(
        int BeerDrinkId,
        bool IsDefault,
        int CratesLeft,
        DateTimeOffset? CarriedStockWarningSentAt
    );
}
