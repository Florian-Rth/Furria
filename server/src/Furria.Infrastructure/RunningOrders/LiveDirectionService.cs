using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class LiveDirectionService
{
    private const string NoRunningOrderMessage = "Für diese Veranstaltung gibt es keinen Ablauf.";
    private const string NotPlacedMessage = "Dieser Auftritt steht nicht im Ablauf dieses Abends.";
    private const string MovedMeanwhileMessage =
        "Die Regie ist inzwischen weitergegangen. Bitte neu laden.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public LiveDirectionService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<LiveDirectionDetails?> GetAsync(int eventId, CancellationToken ct)
    {
        var live = await _dbContext
            .LiveDirections.AsNoTracking()
            .SingleOrDefaultAsync(row => row.CalendarEntryId == eventId, ct);

        return live is null ? null : DetailsOf(live);
    }

    public async Task<Result<LiveDirectionDetails>> MoveAsync(
        MoveLiveCommand command,
        CancellationToken ct
    )
    {
        if (
            !await _dbContext.RunningOrders.AnyAsync(
                row => row.CalendarEntryId == command.EventId,
                ct
            )
        )
            return Result<LiveDirectionDetails>.NotFound(NoRunningOrderMessage);
        if (command.To is { } to && !await IsPlacedAsync(command.EventId, to, ct))
            return Result<LiveDirectionDetails>.NotFound(NotPlacedMessage);

        var live = await _dbContext.LiveDirections.SingleOrDefaultAsync(
            row => row.CalendarEntryId == command.EventId,
            ct
        );
        if (live?.AppearanceId != command.From)
            return Result<LiveDirectionDetails>.Conflict(MovedMeanwhileMessage);

        var now = _timeProvider.GetUtcNow();
        live ??= Started(command.EventId, now);
        live.AppearanceId = command.To;
        live.MovedAt = now;

        return await SavedAsync(live, ct);
    }

    private async Task<bool> IsPlacedAsync(int eventId, int appearanceId, CancellationToken ct) =>
        await _dbContext.Appearances.AnyAsync(
            appearance =>
                appearance.Id == appearanceId
                && appearance.CalendarEntryId == eventId
                && appearance.Position != null,
            ct
        );

    private LiveDirection Started(int eventId, DateTimeOffset now)
    {
        var live = new LiveDirection { CalendarEntryId = eventId, StartedAt = now };
        _dbContext.LiveDirections.Add(live);

        return live;
    }

    private async Task<Result<LiveDirectionDetails>> SavedAsync(
        LiveDirection live,
        CancellationToken ct
    )
    {
        try
        {
            await _dbContext.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Result<LiveDirectionDetails>.Conflict(MovedMeanwhileMessage);
        }

        return Result<LiveDirectionDetails>.Success(DetailsOf(live));
    }

    [Pure]
    private static LiveDirectionDetails DetailsOf(LiveDirection live) =>
        new()
        {
            AppearanceId = live.AppearanceId,
            StartedAt = live.StartedAt,
            MovedAt = live.MovedAt,
        };
}
