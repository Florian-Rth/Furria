using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerStockService
{
    private const string UnknownPotMessage = "Diese Bierliste gibt es nicht.";
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
            command.BeerPotId,
            new BeerStockMovement
            {
                Kind = BeerStockMovementKind.Delivery,
                Crates = command.Crates,
                BookedByPersonId = command.BookedByPersonId,
            },
            ct
        );

    public Task<Result> BookCorrectionAsync(
        BeerStockCorrectionCommand command,
        CancellationToken ct
    ) =>
        BookAsync(
            command.BeerPotId,
            new BeerStockMovement
            {
                Kind = BeerStockMovementKind.Correction,
                Crates = command.Crates,
                Reason = command.Reason,
                BookedByPersonId = command.BookedByPersonId,
            },
            ct
        );

    public async Task<Result<BeerStockDetails>> GetStockAsync(int beerPotId, CancellationToken ct)
    {
        var isOpen = await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => pot.Id == beerPotId)
            .Select(pot => (bool?)(pot.ClosedAt == null))
            .SingleOrDefaultAsync(ct);
        if (isOpen is null)
            return Result<BeerStockDetails>.NotFound(UnknownPotMessage);

        var crates = await StockOfAsync(beerPotId, ct);

        return Result<BeerStockDetails>.Success(
            new BeerStockDetails
            {
                Crates = crates,
                Forecast = ProjectionOf(crates, isOpen.Value, cratesTakenInPaceWindow: 0),
                Movements = await MovementsOfAsync(beerPotId, ct),
            }
        );
    }

    private BeerStockProjection ProjectionOf(
        int crates,
        bool isOpen,
        int cratesTakenInPaceWindow
    ) =>
        new()
        {
            PaceWindowDays = BeerStockForecast.PaceWindowDays,
            CratesTakenInPaceWindow = cratesTakenInPaceWindow,
            ProjectedEmptyOn = isOpen
                ? BeerStockForecast.ProjectedEmptyOn(
                    crates,
                    cratesTakenInPaceWindow,
                    ClubClock.Today(_timeProvider)
                )
                : null,
        };

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
                Crates = movement.Crates,
                Reason = movement.Reason,
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

    private async Task<Result> BookAsync(
        int beerPotId,
        BeerStockMovement movement,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pot = await LockedPotAsync(beerPotId, ct);
        if (pot is null)
            return Result.NotFound(UnknownPotMessage);

        if (pot.ClosedAt is not null)
            return Result.Conflict(ClosedPotMessage);

        if (await StockOfAsync(beerPotId, ct) + movement.Crates < 0)
            return Result.Conflict(BelowZeroMessage);

        movement.BeerPotId = beerPotId;
        movement.BookedAt = _timeProvider.GetUtcNow();
        _dbContext.BeerStockMovements.Add(movement);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private Task<int> StockOfAsync(int beerPotId, CancellationToken ct) =>
        _dbContext
            .BeerStockMovements.AsNoTracking()
            .Where(movement => movement.BeerPotId == beerPotId)
            .SumAsync(movement => movement.Crates, ct);

    private async Task<BeerPot?> LockedPotAsync(int beerPotId, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM beer_pot WHERE id = {beerPotId} FOR UPDATE",
            ct
        );

        return await _dbContext
            .BeerPots.AsNoTracking()
            .SingleOrDefaultAsync(pot => pot.Id == beerPotId, ct);
    }
}
