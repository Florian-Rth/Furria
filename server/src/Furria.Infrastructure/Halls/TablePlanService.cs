using Furria.Application.Halls;
using Furria.Application.Results;
using Furria.Core.Halls;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Halls;

public sealed class TablePlanService
{
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string NoTablePlanMessage = "Diese Veranstaltung hat keinen Tischplan.";
    private const string UnknownHallMessage = "Diesen Saal gibt es nicht.";
    private const string UnknownCopySourceMessage =
        "Die gewählte Veranstaltung hat keinen Tischplan zum Übernehmen.";
    private const string UnknownTableTypeMessage =
        "Der Tischplan nennt eine Tischart, die es nicht gibt.";

    private readonly AppDbContext _dbContext;

    public TablePlanService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<TablePlanSummary>> GetTablePlansAsync(CancellationToken ct)
    {
        var rows = await _dbContext
            .TablePlans.AsNoTracking()
            .OrderByDescending(plan => plan.Event!.CalendarEntry!.StartsAt)
            .ThenBy(plan => plan.CalendarEntryId)
            .Select(plan => new
            {
                plan.CalendarEntryId,
                plan.Event!.CalendarEntry!.Title,
                plan.Event.CalendarEntry.StartsAt,
                plan.HallId,
                HallName = plan.Hall!.Name,
                plan.Tables,
            })
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => new TablePlanSummary
            {
                EventId = row.CalendarEntryId,
                Title = row.Title,
                StartsAt = row.StartsAt,
                HallId = row.HallId,
                HallName = row.HallName,
                Tables = row.Tables,
            }),
        ];
    }

    public async Task<TablePlanDetails?> GetTablePlanAsync(int eventId, CancellationToken ct)
    {
        var plan = await _dbContext
            .TablePlans.AsNoTracking()
            .Include(row => row.Hall)
                .ThenInclude(hall => hall!.Venue)
            .SingleOrDefaultAsync(row => row.CalendarEntryId == eventId, ct);

        return plan?.Hall is null
            ? null
            : new TablePlanDetails
            {
                EventId = plan.CalendarEntryId,
                HallId = plan.HallId,
                Document = plan.Document,
                Version = plan.Version,
                Hall = HallService.ToDetails(plan.Hall),
            };
    }

    public async Task<Result> CreateTablePlanAsync(
        CreateTablePlanCommand command,
        CancellationToken ct
    )
    {
        if (!await IsEventAsync(command.EventId, ct))
            return Result.NotFound(UnknownEventMessage);
        if (
            await _dbContext.TablePlans.AnyAsync(
                plan => plan.CalendarEntryId == command.EventId,
                ct
            )
        )
            return Result.Conflict(WriteConflictMessages.TablePlanExists);
        if (!await IsHallAsync(command.HallId, ct))
            return Result.Validation(UnknownHallMessage);

        var created = new TablePlan
        {
            CalendarEntryId = command.EventId,
            HallId = command.HallId,
            Document = TablePlanDocument.Empty,
            Version = 1,
        };
        if (command.CopyFromEventId is { } sourceEventId)
        {
            var source = await _dbContext
                .TablePlans.AsNoTracking()
                .SingleOrDefaultAsync(plan => plan.CalendarEntryId == sourceEventId, ct);
            if (source is null)
                return Result.Validation(UnknownCopySourceMessage);
            created.Document = source.Document;
            created.Tables = source.Tables;
            created.Chairs = source.Chairs;
        }

        _dbContext.TablePlans.Add(created);
        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result<int>> SaveTablePlanAsync(
        SaveTablePlanCommand command,
        CancellationToken ct
    )
    {
        var plan = await _dbContext.TablePlans.SingleOrDefaultAsync(
            row => row.CalendarEntryId == command.EventId,
            ct
        );
        if (plan is null)
            return Result<int>.NotFound(NoTablePlanMessage);
        if (plan.Version != command.Version)
            return Result<int>.Conflict(WriteConflictMessages.ChangedMeanwhile);
        if (!await IsHallAsync(command.HallId, ct))
            return Result<int>.Validation(UnknownHallMessage);
        if (!await AreKnownTableTypesAsync(command.Document, ct))
            return Result<int>.Validation(UnknownTableTypeMessage);

        plan.HallId = command.HallId;
        plan.Document = command.Document;
        plan.Tables = command.Count.Tables;
        plan.Chairs = command.Count.Chairs;
        plan.Version++;
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(plan.Version);
    }

    public async Task<Result> SetNeededAsync(int eventId, bool isNeeded, CancellationToken ct)
    {
        var tracked = await _dbContext.Events.SingleOrDefaultAsync(
            row => row.CalendarEntryId == eventId,
            ct
        );
        if (tracked is null)
            return Result.NotFound(UnknownEventMessage);

        tracked.WithoutTablePlan = !isNeeded;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<IReadOnlyDictionary<int, TablePlanCount>> CountsOfAsync(
        IReadOnlyCollection<int> eventIds,
        CancellationToken ct
    ) =>
        await _dbContext
            .TablePlans.AsNoTracking()
            .Where(plan => eventIds.Contains(plan.CalendarEntryId))
            .ToDictionaryAsync(
                plan => plan.CalendarEntryId,
                plan => new TablePlanCount(plan.Tables, plan.Chairs),
                ct
            );

    private Task<bool> IsEventAsync(int eventId, CancellationToken ct) =>
        _dbContext.Events.AnyAsync(row => row.CalendarEntryId == eventId, ct);

    private Task<bool> IsHallAsync(int hallId, CancellationToken ct) =>
        _dbContext.Halls.AnyAsync(hall => hall.Id == hallId, ct);

    private async Task<bool> AreKnownTableTypesAsync(
        TablePlanDocument document,
        CancellationToken ct
    )
    {
        var named = document.Rows.Select(row => row.TableTypeId).Distinct().ToList();
        var known = await _dbContext.TableTypes.CountAsync(type => named.Contains(type.Id), ct);

        return known == named.Count;
    }
}
