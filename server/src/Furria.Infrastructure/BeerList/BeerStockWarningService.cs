using Furria.Application.Authorization;
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

        var beerPotId = await ArmedOpenPotIdAsync(ct);
        if (beerPotId is not { } armedPotId)
            return;

        var stock = await _beerStockService.GetStockAsync(armedPotId, ct);
        if (!stock.IsSuccess)
            return;

        var today = ClubClock.DayOf(now);
        var crates = stock.Value.Crates;
        var forecast = stock.Value.Forecast;
        if (
            forecast.ProjectedEmptyOn is not { } projectedEmptyOn
            || !BeerListNoticeSchedule.IsStockWarningDue(projectedEmptyOn, today)
        )
            return;

        var message = BeerListPushes.StockWarning(crates, projectedEmptyOn, today);
        var delivered = await WarnOperatorsAsync(message, today, ct);
        if (delivered == 0)
            return;

        await RecordWarningOnOpenPotAsync(now, ct);
        _logger.LogInformation(
            "Beer stock warning for pot {BeerPotId} reached {DeliveredDevices} devices",
            armedPotId,
            delivered
        );
    }

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

    private Task<int?> ArmedOpenPotIdAsync(CancellationToken ct) =>
        _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => pot.ClosedAt == null)
            .Where(pot =>
                pot.StockWarningSentAt == null
                || _dbContext.BeerStockMovements.Any(movement =>
                    movement.BeerPotId == pot.Id
                    && movement.Kind == BeerStockMovementKind.Delivery
                    && movement.BookedAt > pot.StockWarningSentAt
                )
            )
            .Select(pot => (int?)pot.Id)
            .SingleOrDefaultAsync(ct);

    private Task RecordWarningOnOpenPotAsync(DateTimeOffset sentAt, CancellationToken ct) =>
        _dbContext
            .BeerPots.Where(pot => pot.ClosedAt == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(pot => pot.StockWarningSentAt, sentAt),
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
}
