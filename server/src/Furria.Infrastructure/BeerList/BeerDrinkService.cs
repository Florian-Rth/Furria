using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerDrinkService
{
    private const string ClosedPotMessage =
        "Diese Bierliste ist übergeben, ihre Getränke lassen sich nicht mehr ändern.";
    private const string ListedDrinkMessage = "Dieses Getränk steht schon auf der Bierliste.";
    private const string AlreadyRetiredMessage =
        "Dieses Getränk ist schon von der Bierliste genommen.";
    private const string RetiredDefaultMessage =
        "Ein von der Bierliste genommenes Getränk kann nicht Standard sein.";
    private const string StockLeftMessage =
        "Von der Bierliste nehmen lässt sich ein Getränk erst, wenn keine Kiste mehr da ist.";

    private static readonly string TooManyDrinksMessage =
        $"Eine Bierliste führt höchstens {BeerPot.MaxDrinks} Getränke.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BeerDrinkService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result<int>> ListDrinkAsync(BeerDrinkCommand command, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var openPot = await OpenPotCheckAsync(command.BeerPotId, ct);
        if (!openPot.IsSuccess)
            return Result<int>.Carrying(openPot);

        var drink = await BeerDrinkCatalogue.DrinkNamedAsync(_dbContext, command.Settings.Name, ct);
        var potDrink =
            drink.Id == 0
                ? null
                : await BeerPotLedger
                    .PotDrink(_dbContext, command.BeerPotId, drink.Id)
                    .SingleOrDefaultAsync(ct);
        if (potDrink is { RetiredAt: null })
            return Result<int>.Conflict(ListedDrinkMessage);

        if (await ListedDrinkCountAsync(command.BeerPotId, ct) >= BeerPot.MaxDrinks)
            return Result<int>.Conflict(TooManyDrinksMessage);

        ListOnPot(potDrink, command, drink);
        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Carrying(saved);

        await transaction.CommitAsync(ct);
        return Result<int>.Success(drink.Id);
    }

    public async Task<Result> UpdateDrinkAsync(BeerDrinkUpdateCommand command, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var openPot = await OpenPotCheckAsync(command.BeerPotId, ct);
        if (!openPot.IsSuccess)
            return openPot;

        var potDrink = await BeerPotLedger
            .PotDrink(_dbContext, command.BeerPotId, command.BeerDrinkId)
            .Include(row => row.Drink)
            .SingleOrDefaultAsync(ct);
        if (potDrink?.Drink is not { } drink)
            return Result.NotFound(BeerListMessages.UnknownDrink);

        if (
            await BeerDrinkCatalogue.IsNameTakenAsync(
                _dbContext,
                command.Settings.Name,
                drink.Id,
                ct
            )
        )
            return Result.Conflict(WriteConflictMessages.DuplicateBeerDrink);

        drink.Name = command.Settings.Name;
        potDrink.CratePriceCents = command.Settings.CratePriceCents;
        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (saved.IsSuccess)
            await transaction.CommitAsync(ct);

        return saved;
    }

    public async Task<Result> RetireDrinkAsync(int beerPotId, int beerDrinkId, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var openPot = await OpenPotCheckAsync(beerPotId, ct);
        if (!openPot.IsSuccess)
            return openPot;

        var potDrink = await BeerPotLedger
            .PotDrink(_dbContext, beerPotId, beerDrinkId)
            .SingleOrDefaultAsync(ct);
        if (potDrink is null)
            return Result.NotFound(BeerListMessages.UnknownDrink);

        if (potDrink.RetiredAt is not null)
            return Result.Conflict(AlreadyRetiredMessage);

        if (await BeerPotLedger.StockOfAsync(_dbContext, beerPotId, beerDrinkId, ct) != 0)
            return Result.Conflict(StockLeftMessage);

        potDrink.RetiredAt = _timeProvider.GetUtcNow();
        potDrink.IsDefault = false;
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> MakeDefaultAsync(int beerPotId, int beerDrinkId, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var openPot = await OpenPotCheckAsync(beerPotId, ct);
        if (!openPot.IsSuccess)
            return openPot;

        var candidates = await ChosenAndCurrentDefaultAsync(beerPotId, beerDrinkId, ct);
        var chosen = candidates.SingleOrDefault(potDrink => potDrink.BeerDrinkId == beerDrinkId);
        if (chosen is null)
            return Result.NotFound(BeerListMessages.UnknownDrink);

        if (chosen.RetiredAt is not null)
            return Result.Conflict(RetiredDefaultMessage);

        await SwitchDefaultAsync(chosen, candidates, ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    private Task<List<BeerPotDrink>> ChosenAndCurrentDefaultAsync(
        int beerPotId,
        int beerDrinkId,
        CancellationToken ct
    ) =>
        _dbContext
            .BeerPotDrinks.Where(potDrink =>
                potDrink.BeerPotId == beerPotId
                && (potDrink.BeerDrinkId == beerDrinkId || potDrink.IsDefault)
            )
            .ToListAsync(ct);

    private async Task SwitchDefaultAsync(
        BeerPotDrink chosen,
        IEnumerable<BeerPotDrink> candidates,
        CancellationToken ct
    )
    {
        foreach (var previous in candidates.Where(potDrink => potDrink != chosen))
            previous.IsDefault = false;

        await _dbContext.SaveChangesAsync(ct);
        chosen.IsDefault = true;
        await _dbContext.SaveChangesAsync(ct);
    }

    private void ListOnPot(BeerPotDrink? retired, BeerDrinkCommand command, BeerDrink drink)
    {
        if (retired is null)
        {
            _dbContext.BeerPotDrinks.Add(
                new BeerPotDrink
                {
                    BeerPotId = command.BeerPotId,
                    Drink = drink,
                    CratePriceCents = command.Settings.CratePriceCents,
                }
            );
            return;
        }

        retired.RetiredAt = null;
        retired.StockWarningSentAt = null;
        retired.CratePriceCents = command.Settings.CratePriceCents;
    }

    private async Task<Result> OpenPotCheckAsync(int beerPotId, CancellationToken ct)
    {
        var isOpen = await BeerPotLedger
            .LockedPot(_dbContext, beerPotId)
            .Select(pot => (bool?)(pot.ClosedAt == null))
            .SingleOrDefaultAsync(ct);

        return isOpen switch
        {
            null => Result.NotFound(BeerListMessages.UnknownPot),
            false => Result.Conflict(ClosedPotMessage),
            true => Result.Success(),
        };
    }

    private Task<int> ListedDrinkCountAsync(int beerPotId, CancellationToken ct) =>
        _dbContext
            .BeerPotDrinks.AsNoTracking()
            .CountAsync(
                potDrink => potDrink.BeerPotId == beerPotId && potDrink.RetiredAt == null,
                ct
            );
}
