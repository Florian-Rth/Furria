using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class KeyHoldingService
{
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string UnknownHoldingMessage = "Diesen Schlüssel gibt es nicht.";
    private const string OpenHoldingMessage =
        "Diese Person hat für diesen Ort schon einen Schlüssel.";
    private const string ReturnedHoldingMessage = "Dieser Schlüssel ist schon zurückgenommen.";
    private const string ReturnBeforeHandoutMessage =
        "Ein Schlüssel kann nicht vor seiner Ausgabe zurückgenommen werden.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public KeyHoldingService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<KeyHoldingVenueSummary>> GetVenuesWithHoldingsAsync(
        CancellationToken ct
    )
    {
        var venues = await _dbContext
            .Venues.AsNoTracking()
            .OrderBy(venue => venue.ArchivedOn != null)
            .ThenBy(venue => EF.Functions.Collate(venue.Name, GermanCollation.Name))
            .ThenBy(venue => venue.Id)
            .Select(venue => new VenueRow(venue.Id, venue.Name, venue.ArchivedOn))
            .ToListAsync(ct);

        if (venues.Count == 0)
            return [];

        var activePeople = _dbContext.People.Where(
            _dbContext.IsActiveInClubOn(ClubClock.Today(_timeProvider))
        );
        var holdings = await _dbContext
            .KeyHoldings.AsNoTracking()
            .OrderBy(holding => holding.UntilOn != null)
            .ThenByDescending(holding => holding.UntilOn)
            .ThenBy(holding => EF.Functions.Collate(holding.Person!.LastName, GermanCollation.Name))
            .ThenBy(holding =>
                EF.Functions.Collate(holding.Person!.FirstName, GermanCollation.Name)
            )
            .ThenBy(holding => holding.SinceOn)
            .ThenBy(holding => holding.Id)
            .Select(HoldingProjectionAmong(activePeople))
            .ToListAsync(ct);

        var holdingsByVenue = holdings
            .GroupBy(holding => holding.VenueId)
            .ToDictionary(byVenue => byVenue.Key, byVenue => ToSummaries(byVenue));

        return
        [
            .. venues.Select(venue => new KeyHoldingVenueSummary
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                ArchivedOn = venue.ArchivedOn,
                Holdings = holdingsByVenue.TryGetValue(venue.VenueId, out var held) ? held : [],
            }),
        ];
    }

    public async Task<Result<int>> OpenAsync(KeyHoldingOpenCommand command, CancellationToken ct)
    {
        var venue = await VenueRowAsync(command.VenueId, ct);

        if (venue is null)
            return Result<int>.NotFound(UnknownVenueMessage);

        if (venue.ArchivedOn is not null)
            return Result<int>.Validation(ArchivedVenueMessage(venue.Name));

        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        if (await HoldsOpenKeyAsync(command.VenueId, command.PersonId, ct))
            return Result<int>.Conflict(OpenHoldingMessage);

        var holding = new KeyHolding
        {
            VenueId = command.VenueId,
            PersonId = command.PersonId,
            SinceOn = command.SinceOn,
        };

        _dbContext.KeyHoldings.Add(holding);
        await _dbContext.LiftArchiveOfAsync(command.PersonId, ct);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(holding.Id);
    }

    public async Task<Result> EndAsync(KeyHoldingEndCommand command, CancellationToken ct)
    {
        var holding = await _dbContext.KeyHoldings.SingleOrDefaultAsync(
            row => row.Id == command.KeyHoldingId,
            ct
        );

        if (holding is null)
            return Result.NotFound(UnknownHoldingMessage);

        if (holding.UntilOn is not null)
            return Result.Conflict(ReturnedHoldingMessage);

        if (command.UntilOn < holding.SinceOn)
            return Result.Validation(ReturnBeforeHandoutMessage);

        holding.UntilOn = command.UntilOn;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private static string ArchivedVenueMessage(string name) =>
        $"Der Ort „{name}“ ist archiviert. Dafür wird kein Schlüssel mehr ausgegeben.";

    [Pure]
    private static Expression<Func<KeyHolding, HoldingRow>> HoldingProjectionAmong(
        IQueryable<Person> activePeople
    ) =>
        holding => new HoldingRow(
            holding.Id,
            holding.VenueId,
            holding.PersonId,
            holding.Person!.FirstName,
            holding.Person!.LastName,
            holding.SinceOn,
            holding.UntilOn,
            activePeople.Any(person => person.Id == holding.PersonId)
        );

    private static IReadOnlyList<KeyHoldingSummary> ToSummaries(IEnumerable<HoldingRow> rows) =>
        [.. rows.Select(ToSummary)];

    private static KeyHoldingSummary ToSummary(HoldingRow row) =>
        new()
        {
            KeyHoldingId = row.KeyHoldingId,
            PersonId = row.PersonId,
            FirstName = row.FirstName,
            LastName = row.LastName,
            SinceOn = row.SinceOn,
            UntilOn = row.UntilOn,
            HolderIsActiveInClub = row.HolderIsActiveInClub,
        };

    private Task<VenueRow?> VenueRowAsync(int venueId, CancellationToken ct) =>
        _dbContext
            .Venues.AsNoTracking()
            .Where(venue => venue.Id == venueId)
            .Select(venue => new VenueRow(venue.Id, venue.Name, venue.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    private Task<bool> HoldsOpenKeyAsync(int venueId, int personId, CancellationToken ct) =>
        _dbContext
            .KeyHoldings.AsNoTracking()
            .AnyAsync(
                row => row.VenueId == venueId && row.PersonId == personId && row.UntilOn == null,
                ct
            );

    private sealed record VenueRow(int VenueId, string Name, DateOnly? ArchivedOn);

    private sealed record HoldingRow(
        int KeyHoldingId,
        int VenueId,
        int PersonId,
        string FirstName,
        string LastName,
        DateOnly SinceOn,
        DateOnly? UntilOn,
        bool HolderIsActiveInClub
    );
}
