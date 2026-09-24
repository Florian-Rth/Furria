using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class VenueService
{
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage =
        "Ein archivierter Ort kann nicht bearbeitet werden.";
    private const string DuplicateNameMessage = WriteConflictMessages.DuplicateVenue;
    private const string AlreadyArchivedMessage = "Dieser Ort ist bereits archiviert.";
    private const string NotArchivedMessage = "Dieser Ort ist nicht archiviert.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public VenueService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<VenueSummary>> GetVenuesAsync(CancellationToken ct) =>
        await _dbContext
            .Venues.AsNoTracking()
            .OrderBy(venue => venue.ArchivedOn != null)
            .ThenBy(venue => venue.Name)
            .ThenBy(venue => venue.Id)
            .Select(venue => new VenueSummary
            {
                VenueId = venue.Id,
                Name = venue.Name,
                Street = venue.Street,
                Zip = venue.Zip,
                City = venue.City,
                Hint = venue.Hint,
                ArchivedOn = venue.ArchivedOn,
            })
            .ToListAsync(ct);

    public async Task<IReadOnlyList<RunningVenueSummary>> GetRunningVenuesAsync(
        CancellationToken ct
    ) =>
        await _dbContext
            .Venues.AsNoTracking()
            .Where(venue => venue.ArchivedOn == null)
            .OrderBy(venue => venue.Name)
            .ThenBy(venue => venue.Id)
            .Select(venue => new RunningVenueSummary { VenueId = venue.Id, Name = venue.Name })
            .ToListAsync(ct);

    public async Task<Result<int>> CreateAsync(CreateVenueCommand command, CancellationToken ct)
    {
        if (await NameIsTakenAsync(command.Name, null, ct))
            return Result<int>.Conflict(DuplicateNameMessage);

        var venue = new Venue
        {
            Name = command.Name,
            Street = command.Street,
            Zip = command.Zip,
            City = command.City,
            Hint = command.Hint,
        };

        _dbContext.Venues.Add(venue);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(venue.Id);
    }

    public async Task<Result> UpdateAsync(UpdateVenueCommand command, CancellationToken ct)
    {
        var venue = await TrackedVenueAsync(command.VenueId, ct);

        if (venue is null)
            return Result.NotFound(UnknownVenueMessage);

        if (venue.ArchivedOn is not null)
            return Result.Conflict(ArchivedVenueMessage);

        if (await NameIsTakenAsync(command.Name, command.VenueId, ct))
            return Result.Conflict(DuplicateNameMessage);

        venue.Name = command.Name;
        venue.Street = command.Street;
        venue.Zip = command.Zip;
        venue.City = command.City;
        venue.Hint = command.Hint;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> ArchiveAsync(int venueId, CancellationToken ct)
    {
        var venue = await TrackedVenueAsync(venueId, ct);

        if (venue is null)
            return Result.NotFound(UnknownVenueMessage);

        if (venue.ArchivedOn is not null)
            return Result.Conflict(AlreadyArchivedMessage);

        venue.ArchivedOn = ClubClock.Today(_timeProvider);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int venueId, CancellationToken ct)
    {
        var venue = await TrackedVenueAsync(venueId, ct);

        if (venue is null)
            return Result.NotFound(UnknownVenueMessage);

        if (venue.ArchivedOn is null)
            return Result.Conflict(NotArchivedMessage);

        venue.ArchivedOn = null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private Task<Venue?> TrackedVenueAsync(int venueId, CancellationToken ct) =>
        _dbContext.Venues.SingleOrDefaultAsync(row => row.Id == venueId, ct);

    private Task<bool> NameIsTakenAsync(string name, int? exceptVenueId, CancellationToken ct)
    {
        var lowered = name.ToLowerInvariant();

        return _dbContext
            .Venues.AsNoTracking()
            .AnyAsync(row => row.Id != exceptVenueId && row.Name.ToLower() == lowered, ct);
    }
}
