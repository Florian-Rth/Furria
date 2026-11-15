using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Application.Push;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Core.Push;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerStockWarningService
{
    private readonly AppDbContext _dbContext;
    private readonly BeerStockService _beerStockService;
    private readonly PushSender _pushSender;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<BeerStockWarningService> _logger;

    public BeerStockWarningService(
        AppDbContext dbContext,
        BeerStockService beerStockService,
        PushSender pushSender,
        TimeProvider timeProvider,
        ILogger<BeerStockWarningService> logger
    )
    {
        _dbContext = dbContext;
        _beerStockService = beerStockService;
        _pushSender = pushSender;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task WarnIfRunningOutAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        if (!BeerListNoticeSchedule.IsSendingTime(now))
            return;

        var armed = await ArmedDrinksOfOpenPotAsync(ct);
        if (armed.Count == 0)
            return;

        var beerPotId = armed[0].BeerPotId;
        var stock = await _beerStockService.GetStockAsync(beerPotId, ct);
        if (!stock.IsSuccess)
            return;

        var today = ClubClock.DayOf(now);
        var armedDrinkIds = armed.Select(drink => drink.BeerDrinkId).ToHashSet();
        var due = DueDrinks(stock.Value.Drinks, armedDrinkIds, today);
        if (due.Count == 0)
            return;

        var message = BeerListPushes.StockWarning(
            [.. due.Select(drink => drink.RunningLow)],
            today
        );
        var delivered = await WarnOperatorsAsync(message, today, ct);
        if (delivered == 0)
            return;

        await RecordWarningAsync(beerPotId, [.. due.Select(drink => drink.BeerDrinkId)], now, ct);
        _logger.LogInformation(
            "Beer stock warning for pot {BeerPotId} on {DueDrinks} drinks reached {DeliveredDevices} devices",
            beerPotId,
            due.Count,
            delivered
        );
    }

    [Pure]
    private static IReadOnlyList<DueDrink> DueDrinks(
        IReadOnlyList<BeerDrinkStockSummary> drinks,
        IReadOnlySet<int> armedDrinkIds,
        DateOnly today
    ) =>
        [
            .. drinks
                .Where(drink => armedDrinkIds.Contains(drink.BeerDrinkId) && !drink.IsRetired)
                .Select(drink => (drink, projectedEmptyOn: drink.Forecast.ProjectedEmptyOn))
                .Where(entry =>
                    entry.projectedEmptyOn is { } emptyOn
                    && BeerListNoticeSchedule.IsStockWarningDue(emptyOn, today)
                )
                .OrderBy(entry => entry.projectedEmptyOn)
                .Select(entry => new DueDrink(
                    entry.drink.BeerDrinkId,
                    new BeerDrinkRunningLow(
                        entry.drink.Name,
                        entry.drink.Crates,
                        entry.projectedEmptyOn!.Value
                    )
                )),
        ];

    private async Task<int> WarnOperatorsAsync(
        PushMessage message,
        DateOnly today,
        CancellationToken ct
    )
    {
        var delivered = 0;
        foreach (var accountId in await OperatorAccountsAsync(today, ct))
            delivered += (await _pushSender.SendAsync(accountId, message, ct)).Delivered;

        return delivered;
    }

    private async Task<IReadOnlyList<ArmedDrink>> ArmedDrinksOfOpenPotAsync(CancellationToken ct) =>
        await _dbContext
            .BeerPotDrinks.AsNoTracking()
            .Where(potDrink => potDrink.Pot!.ClosedAt == null && potDrink.RetiredAt == null)
            .Where(potDrink =>
                potDrink.StockWarningSentAt == null
                || _dbContext.BeerStockMovements.Any(movement =>
                    movement.BeerPotId == potDrink.BeerPotId
                    && movement.BeerDrinkId == potDrink.BeerDrinkId
                    && movement.Kind == BeerStockMovementKind.Delivery
                    && movement.BookedAt > potDrink.StockWarningSentAt
                )
            )
            .Select(potDrink => new ArmedDrink(potDrink.BeerPotId, potDrink.BeerDrinkId))
            .ToListAsync(ct);

    private Task RecordWarningAsync(
        int beerPotId,
        IReadOnlyList<int> beerDrinkIds,
        DateTimeOffset sentAt,
        CancellationToken ct
    ) =>
        _dbContext
            .BeerPotDrinks.Where(potDrink =>
                potDrink.BeerPotId == beerPotId && beerDrinkIds.Contains(potDrink.BeerDrinkId)
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(potDrink => potDrink.StockWarningSentAt, sentAt),
                ct
            );

    private Task<List<int>> OperatorAccountsAsync(DateOnly today, CancellationToken ct)
    {
        var operatorIds = PermissionHolderQuery.PersonIdsHolding(
            _dbContext,
            FurriaPermissions.BeerListManage,
            today
        );

        return _dbContext
            .Users.AsNoTracking()
            .Where(account =>
                account.PersonId != null
                && operatorIds.Contains(account.PersonId.Value)
                && !account.IsDisabled
            )
            .ListeningTo(_dbContext, PushTopic.BeerStock)
            .OrderBy(account => account.Id)
            .Select(account => account.Id)
            .ToListAsync(ct);
    }

    private sealed record ArmedDrink(int BeerPotId, int BeerDrinkId);

    private sealed record DueDrink(int BeerDrinkId, BeerDrinkRunningLow RunningLow);
}
