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
            command.BeerPotId,
            new StockChange(
                BeerStockMovementKind.Delivery,
                command.Crates,
                null,
                command.BookedByPersonId
            ),
            ct
        );

    public Task<Result> BookCorrectionAsync(
        BeerStockCorrectionCommand command,
        CancellationToken ct
    ) =>
        BookAsync(
            command.BeerPotId,
            new StockChange(
                BeerStockMovementKind.Correction,
                command.Crates,
                command.Reason,
                command.BookedByPersonId
            ),
            ct
        );

    public async Task<Result<BeerStockDetails>> GetStockAsync(int beerPotId, CancellationToken ct)
    {
        var isOpen = await IsOpenAsync(_dbContext.BeerPots.AsNoTracking(), beerPotId, ct);
        if (isOpen is null)
            return Result<BeerStockDetails>.NotFound(BeerListMessages.UnknownPot);

        var movements = await MovementsOfAsync(beerPotId, ct);
        var crates = movements.Sum(movement => movement.Crates);

        return Result<BeerStockDetails>.Success(
            new BeerStockDetails
            {
                Crates = crates,
                Forecast = ProjectionOf(crates, isOpen.Value, cratesTakenInPaceWindow: 0),
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

    private async Task<Result> BookAsync(int beerPotId, StockChange change, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var isOpen = await IsOpenAsync(LockedPot(beerPotId), beerPotId, ct);
        if (isOpen is null)
            return Result.NotFound(BeerListMessages.UnknownPot);

        if (!isOpen.Value)
            return Result.Conflict(ClosedPotMessage);

        if (await StockOfAsync(beerPotId, ct) + change.Crates < 0)
            return Result.Conflict(BelowZeroMessage);

        _dbContext.BeerStockMovements.Add(
            new BeerStockMovement
            {
                BeerPotId = beerPotId,
                Kind = change.Kind,
                Crates = change.Crates,
                Reason = change.Reason,
                BookedByPersonId = change.BookedByPersonId,
                BookedAt = _timeProvider.GetUtcNow(),
            }
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private Task<int> StockOfAsync(int beerPotId, CancellationToken ct) =>
        _dbContext
            .BeerStockMovements.AsNoTracking()
            .Where(movement => movement.BeerPotId == beerPotId)
            .SumAsync(movement => movement.Crates, ct);

    private IQueryable<BeerPot> LockedPot(int beerPotId) =>
        _dbContext
            .BeerPots.FromSql($"SELECT * FROM beer_pot WHERE id = {beerPotId} FOR UPDATE")
            .AsNoTracking();

    private sealed record StockChange(
        BeerStockMovementKind Kind,
        int Crates,
        BeerStockCorrectionReason? Reason,
        int? BookedByPersonId
    );
}
