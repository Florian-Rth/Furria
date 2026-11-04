using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed partial class BeerListService
{
    private const string HandedOverPotMessage = "Diese Bierliste ist schon übergeben.";
    private const string SuccessorOwnsPotMessage = "Diese Bierliste gehört schon dieser Person.";

    public async Task<Result<BeerPotHandoverDetails>> HandOverAsync(
        BeerPotHandoverCommand command,
        CancellationToken ct
    )
    {
        if (!await PersonExistsAsync(command.SuccessorPersonId, ct))
            return Result<BeerPotHandoverDetails>.NotFound(UnknownPersonMessage);

        if (!await MayManageAsync(command.SuccessorPersonId, ct))
            return Result<BeerPotHandoverDetails>.Validation(OwnerWithoutRightMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pot = await BeerPotLedger
            .LockedPot(_dbContext, command.BeerPotId)
            .Select(row => new HandedOverPot(
                row.Id,
                row.OwnerPersonId,
                row.ClosedAt,
                row.StockWarningSentAt
            ))
            .SingleOrDefaultAsync(ct);
        if (pot is null)
            return Result<BeerPotHandoverDetails>.NotFound(BeerListMessages.UnknownPot);

        if (pot.ClosedAt is not null)
            return Result<BeerPotHandoverDetails>.Conflict(HandedOverPotMessage);

        if (pot.OwnerPersonId == command.SuccessorPersonId)
            return Result<BeerPotHandoverDetails>.Validation(SuccessorOwnsPotMessage);

        var handover = await HandOverLockedAsync(pot, command, ct);
        if (!handover.IsSuccess)
            return handover;

        await transaction.CommitAsync(ct);
        return handover;
    }

    private async Task<Result<BeerPotHandoverDetails>> HandOverLockedAsync(
        HandedOverPot pot,
        BeerPotHandoverCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var cratesLeft = await BeerPotLedger.StockOfAsync(_dbContext, pot.Id, ct);
        var successorPot = new BeerPot
        {
            OwnerPersonId = command.SuccessorPersonId,
            OpenedAt = now,
            StockWarningSentAt = await StockWarningCarriedFromAsync(pot, ct),
        };
        Apply(command.SuccessorSettings, successorPot);

        await CloseAsync(pot.Id, now, ct);
        _dbContext.BeerPots.Add(successorPot);
        if (cratesLeft > 0)
            _dbContext.BeerStockMovements.AddRange(
                CarryMovements(pot.Id, successorPot, cratesLeft, command.HandedOverByPersonId, now)
            );

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        return saved.IsSuccess
            ? Result<BeerPotHandoverDetails>.Success(
                new BeerPotHandoverDetails
                {
                    SuccessorBeerPotId = successorPot.Id,
                    CarriedCrates = cratesLeft,
                }
            )
            : Result<BeerPotHandoverDetails>.Carrying(saved);
    }

    private static BeerStockMovement[] CarryMovements(
        int handedOverPotId,
        BeerPot successorPot,
        int crates,
        int? bookedByPersonId,
        DateTimeOffset bookedAt
    ) =>
        [
            new()
            {
                BeerPotId = handedOverPotId,
                Kind = BeerStockMovementKind.HandedOver,
                Crates = -crates,
                BookedByPersonId = bookedByPersonId,
                BookedAt = bookedAt,
            },
            new()
            {
                Pot = successorPot,
                Kind = BeerStockMovementKind.HandoverCarry,
                Crates = crates,
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

    private async Task<DateTimeOffset?> StockWarningCarriedFromAsync(
        HandedOverPot pot,
        CancellationToken ct
    )
    {
        if (pot.StockWarningSentAt is not { } sentAt)
            return null;

        var deliveredSinceWarning = await _dbContext
            .BeerStockMovements.AsNoTracking()
            .AnyAsync(
                movement =>
                    movement.BeerPotId == pot.Id
                    && movement.Kind == BeerStockMovementKind.Delivery
                    && movement.BookedAt > sentAt,
                ct
            );

        return deliveredSinceWarning ? null : sentAt;
    }

    private sealed record HandedOverPot(
        int Id,
        int? OwnerPersonId,
        DateTimeOffset? ClosedAt,
        DateTimeOffset? StockWarningSentAt
    );
}
