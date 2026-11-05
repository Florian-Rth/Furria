using System.Diagnostics.Contracts;
using Furria.Application.Halls;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Halls;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Halls;

public sealed class SeatingService
{
    private const string UnknownTableTypeMessage = "Diese Tischart gibt es nicht.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public SeatingService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<SeatingDetails> GetSeatingAsync(CancellationToken ct)
    {
        var standard = await StandardAsync(ct);
        var tableTypes = await _dbContext
            .TableTypes.AsNoTracking()
            .OrderBy(type => type.SortOrder)
            .ThenBy(type => type.Id)
            .ToListAsync(ct);

        return new SeatingDetails
        {
            Standard = ToDetails(standard),
            TableTypes = [.. tableTypes.Select(ToSummary)],
        };
    }

    public async Task<Result> SetStandardAsync(SeatingStandardCommand command, CancellationToken ct)
    {
        var standard = await _dbContext.SeatingStandards.SingleOrDefaultAsync(ct);
        if (standard is null)
        {
            standard = new SeatingStandard();
            _dbContext.SeatingStandards.Add(standard);
        }

        standard.ComfortableChairSpacingCm = command.ComfortableChairSpacingCm;
        standard.MaximumChairSpacingCm = command.MaximumChairSpacingCm;
        standard.ChairDepthCm = command.ChairDepthCm;
        standard.AisleWidthCm = command.AisleWidthCm;
        standard.ExitClearanceCm = command.ExitClearanceCm;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result<int>> CreateTableTypeAsync(
        TableTypeCommand command,
        CancellationToken ct
    )
    {
        var lastSortOrder = await _dbContext.TableTypes.MaxAsync(type => (int?)type.SortOrder, ct);
        var tableType = new TableType { SortOrder = (lastSortOrder ?? 0) + 1 };
        Apply(tableType, command);
        _dbContext.TableTypes.Add(tableType);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(tableType.Id);
    }

    public async Task<Result> UpdateTableTypeAsync(
        int tableTypeId,
        TableTypeCommand command,
        CancellationToken ct
    )
    {
        var tableType = await _dbContext.TableTypes.SingleOrDefaultAsync(
            type => type.Id == tableTypeId,
            ct
        );
        if (tableType is null)
            return Result.NotFound(UnknownTableTypeMessage);

        Apply(tableType, command);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> DeleteTableTypeAsync(int tableTypeId, CancellationToken ct)
    {
        var tableType = await _dbContext.TableTypes.SingleOrDefaultAsync(
            type => type.Id == tableTypeId,
            ct
        );
        if (tableType is null)
            return Result.NotFound(UnknownTableTypeMessage);

        if (await IsUsedAsync(tableTypeId, ct))
            tableType.ArchivedOn ??= ClubClock.Today(_timeProvider);
        else
            _dbContext.TableTypes.Remove(tableType);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task<SeatingStandard> StandardAsync(CancellationToken ct) =>
        await _dbContext.SeatingStandards.AsNoTracking().SingleOrDefaultAsync(ct)
        ?? SeatingDefaults.NewStandard();

    private async Task<bool> IsUsedAsync(int tableTypeId, CancellationToken ct)
    {
        var documents = await _dbContext
            .TablePlans.AsNoTracking()
            .Select(plan => plan.Document)
            .ToListAsync(ct);

        return documents.Any(document => document.Rows.Any(row => row.TableTypeId == tableTypeId));
    }

    private static void Apply(TableType tableType, TableTypeCommand command)
    {
        tableType.Name = command.Name.Trim();
        tableType.Shape = command.Shape;
        tableType.LengthCm = command.LengthCm;
        tableType.WidthCm = command.Shape == TableShape.Round ? command.LengthCm : command.WidthCm;
        tableType.SeatsAtEnds = command.Shape == TableShape.Rectangle && command.SeatsAtEnds;
    }

    [Pure]
    private static SeatingStandardDetails ToDetails(SeatingStandard standard) =>
        new()
        {
            ComfortableChairSpacingCm = standard.ComfortableChairSpacingCm,
            MaximumChairSpacingCm = standard.MaximumChairSpacingCm,
            ChairDepthCm = standard.ChairDepthCm,
            AisleWidthCm = standard.AisleWidthCm,
            ExitClearanceCm = standard.ExitClearanceCm,
        };

    [Pure]
    private static TableTypeSummary ToSummary(TableType tableType) =>
        new()
        {
            TableTypeId = tableType.Id,
            Name = tableType.Name,
            Shape = tableType.Shape,
            LengthCm = tableType.LengthCm,
            WidthCm = tableType.WidthCm,
            SeatsAtEnds = tableType.SeatsAtEnds,
            IsArchived = tableType.ArchivedOn is not null,
        };
}
