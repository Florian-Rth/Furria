using System.Diagnostics.Contracts;
using Furria.Application.Halls;
using Furria.Application.Results;
using Furria.Core.Halls;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Halls;

public sealed class HallService
{
    private const string UnknownHallMessage = "Diesen Saal gibt es nicht.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage = "Ein archivierter Ort bekommt keinen neuen Saal.";
    private const string HallInUseMessage =
        "Dieser Saal trägt noch einen Tischplan und lässt sich nicht löschen.";

    private readonly AppDbContext _dbContext;

    public HallService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<HallSummary>> GetHallsAsync(CancellationToken ct) =>
        await _dbContext
            .Halls.AsNoTracking()
            .OrderBy(hall => hall.Venue!.SortOrder)
            .ThenBy(hall => hall.Venue!.Name)
            .ThenBy(hall => hall.Name)
            .Select(hall => new HallSummary
            {
                HallId = hall.Id,
                VenueId = hall.VenueId,
                VenueName = hall.Venue!.Name,
                Name = hall.Name,
                UpdatedAt = hall.UpdatedAt,
            })
            .ToListAsync(ct);

    public async Task<HallDetails?> GetHallAsync(int hallId, CancellationToken ct)
    {
        var hall = await _dbContext
            .Halls.AsNoTracking()
            .Include(row => row.Venue)
            .SingleOrDefaultAsync(row => row.Id == hallId, ct);

        return hall is null ? null : ToDetails(hall);
    }

    public async Task<Result<int>> CreateHallAsync(int venueId, string name, CancellationToken ct)
    {
        var venue = await _dbContext
            .Venues.AsNoTracking()
            .Where(row => row.Id == venueId)
            .Select(row => new { row.ArchivedOn })
            .SingleOrDefaultAsync(ct);
        if (venue is null)
            return Result<int>.Validation(UnknownVenueMessage);
        if (venue.ArchivedOn is not null)
            return Result<int>.Validation(ArchivedVenueMessage);

        var hall = new Hall
        {
            VenueId = venueId,
            Name = name.Trim(),
            Document = HallDocument.Empty,
            Version = 1,
        };
        _dbContext.Halls.Add(hall);
        var saved = await _dbContext.SaveOrConflictAsync(ct);

        return saved.IsSuccess ? Result<int>.Success(hall.Id) : Result<int>.Carrying(saved);
    }

    public async Task<Result<int>> SaveHallAsync(SaveHallCommand command, CancellationToken ct)
    {
        var hall = await _dbContext.Halls.SingleOrDefaultAsync(row => row.Id == command.HallId, ct);
        if (hall is null)
            return Result<int>.NotFound(UnknownHallMessage);
        if (hall.Version != command.Version)
            return Result<int>.Conflict(WriteConflictMessages.ChangedMeanwhile);

        hall.Name = command.Name.Trim();
        hall.Document = command.Document;
        hall.Version++;
        var saved = await _dbContext.SaveOrConflictAsync(ct);

        return saved.IsSuccess ? Result<int>.Success(hall.Version) : Result<int>.Carrying(saved);
    }

    public async Task<Result> DeleteHallAsync(int hallId, CancellationToken ct)
    {
        var hall = await _dbContext.Halls.SingleOrDefaultAsync(row => row.Id == hallId, ct);
        if (hall is null)
            return Result.NotFound(UnknownHallMessage);
        if (await _dbContext.TablePlans.AnyAsync(plan => plan.HallId == hallId, ct))
            return Result.Conflict(HallInUseMessage);

        _dbContext.Halls.Remove(hall);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    [Pure]
    internal static HallDetails ToDetails(Hall hall) =>
        new()
        {
            HallId = hall.Id,
            VenueId = hall.VenueId,
            VenueName = hall.Venue?.Name ?? "",
            Name = hall.Name,
            Document = hall.Document,
            Version = hall.Version,
        };
}
