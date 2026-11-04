using System.Diagnostics.Contracts;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerTabService
{
    private const string NoOpenPotMessage = "Gerade ist keine Bierliste offen.";
    private const string ClosedPotMessage =
        "Diese Bierliste ist übergeben, ihre Kisten lassen sich nicht mehr ändern.";
    private const string BelowZeroMessage =
        "So viele Kisten sind laut Bestand nicht mehr da. Sag dem Getränkewart Bescheid.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string NeverEnrolledMessage = "Diese Person stand nie auf der Bierliste.";
    private const string UnknownCrateMessage = "Diese Kiste gibt es nicht.";
    private const string ForeignCrateMessage =
        "Nur wer eine Kiste gebucht hat, kann sie zurücknehmen.";
    private const string UndoneCrateMessage = "Diese Kiste ist schon zurückgenommen.";
    private const string UndoWindowClosedMessage =
        "Eine Kiste lässt sich nur direkt nach dem Buchen zurücknehmen. Später korrigiert sie der Getränkewart.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BeerTabService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result<BeerCrateBooking>> BookOwnCratesAsync(
        int personId,
        int count,
        CancellationToken ct
    )
    {
        var openPotId = await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => pot.ClosedAt == null)
            .Select(pot => (int?)pot.Id)
            .SingleOrDefaultAsync(ct);
        if (openPotId is null)
            return Result<BeerCrateBooking>.Conflict(NoOpenPotMessage);

        return await BookAsync(new CrateEntry(openPotId.Value, personId, count, personId), ct);
    }

    public async Task<Result<BeerCrateBooking>> BookCratesForAsync(
        BeerCratesForCommand command,
        CancellationToken ct
    )
    {
        if (!await _dbContext.People.AsNoTracking().AnyAsync(p => p.Id == command.PersonId, ct))
            return Result<BeerCrateBooking>.NotFound(UnknownPersonMessage);

        if (!await HasEnrollmentHistoryAsync(command.PersonId, ct))
            return Result<BeerCrateBooking>.Validation(NeverEnrolledMessage);

        return await BookAsync(
            new CrateEntry(
                command.BeerPotId,
                command.PersonId,
                command.Count,
                command.EnteredByPersonId
            ),
            ct
        );
    }

    public async Task<Result> UndoOwnCratesAsync(
        int personId,
        IReadOnlyCollection<int> crateIds,
        CancellationToken ct
    )
    {
        var crates = await CratesAsync(crateIds, ct);
        if (crates.Count != crateIds.Count)
            return Result.NotFound(UnknownCrateMessage);

        if (crates.Any(crate => crate.EnteredByPersonId != personId))
            return Result.Forbidden(ForeignCrateMessage);

        var now = _timeProvider.GetUtcNow();
        if (crates.Any(crate => crate.BookedAt + BeerCrate.UndoWindow < now))
            return Result.Conflict(UndoWindowClosedMessage);

        return await UndoAsync(crates, personId, now, ct);
    }

    public async Task<Result> UndoCrateAsync(
        int beerCrateId,
        int? undoneByPersonId,
        CancellationToken ct
    )
    {
        var crates = await CratesAsync([beerCrateId], ct);
        if (crates.Count == 0)
            return Result.NotFound(UnknownCrateMessage);

        return await UndoAsync(crates, undoneByPersonId, _timeProvider.GetUtcNow(), ct);
    }

    public Task<bool> HasOpenCratesAsync(int personId, CancellationToken ct) =>
        BeerPotLedger
            .TakenCrates(_dbContext)
            .AnyAsync(crate => crate.PersonId == personId && crate.PaidByPaymentId == null, ct);

    public async Task<BeerTabDetails> GetTabAsync(int personId, CancellationToken ct)
    {
        var crates = await BeerPotLedger
            .TakenCrates(_dbContext)
            .Where(crate => crate.PersonId == personId)
            .OrderByDescending(crate => crate.BookedAt)
            .ThenByDescending(crate => crate.Id)
            .Select(crate => new TabRow(
                new BeerTabPotDetails
                {
                    BeerPotId = crate.BeerPotId,
                    IsOpen = crate.Pot!.ClosedAt == null,
                    OpenedAt = crate.Pot.OpenedAt,
                    Owner =
                        crate.Pot.Owner == null
                            ? null
                            : new BeerListPerson
                            {
                                PersonId = crate.Pot.Owner.Id,
                                FirstName = crate.Pot.Owner.FirstName,
                                LastName = crate.Pot.Owner.LastName,
                            },
                    PaymentLink = crate.Pot.PaymentLink,
                    PaymentNote = crate.Pot.PaymentNote,
                    OpenCrates = 0,
                    OpenCents = 0,
                    Crates = Array.Empty<BeerTabCrateSummary>(),
                },
                new BeerTabCrateSummary
                {
                    CrateId = crate.Id,
                    PriceCents = crate.PriceCents,
                    BookedAt = crate.BookedAt,
                    EnteredBy =
                        crate.EnteredBy == null
                            ? null
                            : new BeerListPerson
                            {
                                PersonId = crate.EnteredBy.Id,
                                FirstName = crate.EnteredBy.FirstName,
                                LastName = crate.EnteredBy.LastName,
                            },
                    IsPaid = crate.PaidByPaymentId != null,
                }
            ))
            .ToListAsync(ct);

        return new BeerTabDetails { Pots = PotsOf(crates) };
    }

    public async Task<IReadOnlyList<BeerGiverSummary>> GetGiversAsync(CancellationToken ct) =>
        await BeerPotLedger
            .TakenCrates(_dbContext)
            .Where(crate => crate.Pot!.ClosedAt == null && crate.PersonId != null)
            .GroupBy(crate => new
            {
                PersonId = crate.PersonId!.Value,
                crate.Person!.FirstName,
                crate.Person.LastName,
            })
            .OrderBy(giver => EF.Functions.Collate(giver.Key.LastName, GermanCollation.Name))
            .ThenBy(giver => EF.Functions.Collate(giver.Key.FirstName, GermanCollation.Name))
            .ThenBy(giver => giver.Key.PersonId)
            .Select(giver => new BeerGiverSummary
            {
                PersonId = giver.Key.PersonId,
                FirstName = giver.Key.FirstName,
                LastName = giver.Key.LastName,
                Crates = giver.Count(),
            })
            .ToListAsync(ct);

    [Pure]
    private static IReadOnlyList<BeerTabPotDetails> PotsOf(IReadOnlyList<TabRow> rows) =>
        [
            .. rows.GroupBy(row => row.Pot.BeerPotId)
                .Select(potRows => PotOf(potRows.First().Pot, [.. potRows.Select(r => r.Crate)]))
                .OrderByDescending(pot => pot.IsOpen)
                .ThenByDescending(pot => pot.OpenedAt),
        ];

    [Pure]
    private static BeerTabPotDetails PotOf(
        BeerTabPotDetails pot,
        IReadOnlyList<BeerTabCrateSummary> crates
    )
    {
        var open = crates.Where(crate => !crate.IsPaid).ToList();

        return pot with
        {
            OpenCrates = open.Count,
            OpenCents = open.Sum(crate => crate.PriceCents),
            Crates = crates,
        };
    }

    private async Task<Result<BeerCrateBooking>> BookAsync(CrateEntry entry, CancellationToken ct)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pot = await BeerPotLedger
            .LockedPot(_dbContext, entry.BeerPotId)
            .Select(row => new { row.ClosedAt, row.CratePriceCents })
            .SingleOrDefaultAsync(ct);
        if (pot is null)
            return Result<BeerCrateBooking>.NotFound(BeerListMessages.UnknownPot);

        if (pot.ClosedAt is not null)
            return Result<BeerCrateBooking>.Conflict(ClosedPotMessage);

        if (await BeerPotLedger.StockOfAsync(_dbContext, entry.BeerPotId, ct) < entry.Count)
            return Result<BeerCrateBooking>.Conflict(BelowZeroMessage);

        var now = _timeProvider.GetUtcNow();
        var crates = NewCrates(entry, pot.CratePriceCents, now);
        _dbContext.BeerCrates.AddRange(crates);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result<BeerCrateBooking>.Success(
            new BeerCrateBooking
            {
                CrateIds = [.. crates.Select(crate => crate.Id)],
                UndoableUntil = now + BeerCrate.UndoWindow,
            }
        );
    }

    [Pure]
    private static List<BeerCrate> NewCrates(
        CrateEntry entry,
        int priceCents,
        DateTimeOffset bookedAt
    ) =>
        [
            .. Enumerable
                .Range(0, entry.Count)
                .Select(_ => new BeerCrate
                {
                    BeerPotId = entry.BeerPotId,
                    PersonId = entry.PersonId,
                    PriceCents = priceCents,
                    EnteredByPersonId = entry.EnteredByPersonId,
                    BookedAt = bookedAt,
                }),
        ];

    private async Task<Result> UndoAsync(
        IReadOnlyList<CrateState> crates,
        int? undoneByPersonId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (crates.Any(crate => crate.UndoneAt is not null))
            return Result.Conflict(UndoneCrateMessage);

        var crateIds = crates.Select(crate => crate.Id).ToList();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await LockOpenPotsAsync(crates, ct))
            return Result.Conflict(ClosedPotMessage);

        var undone = await _dbContext
            .BeerCrates.Where(crate => crateIds.Contains(crate.Id) && crate.UndoneAt == null)
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(crate => crate.UndoneAt, now)
                        .SetProperty(crate => crate.UndoneByPersonId, undoneByPersonId),
                ct
            );
        if (undone != crateIds.Count)
            return Result.Conflict(UndoneCrateMessage);

        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    private async Task<bool> LockOpenPotsAsync(
        IReadOnlyList<CrateState> crates,
        CancellationToken ct
    )
    {
        foreach (var beerPotId in crates.Select(crate => crate.BeerPotId).Distinct().Order())
        {
            var isOpen = await BeerPotLedger
                .LockedPot(_dbContext, beerPotId)
                .Select(pot => pot.ClosedAt == null)
                .SingleAsync(ct);
            if (!isOpen)
                return false;
        }

        return true;
    }

    private async Task<IReadOnlyList<CrateState>> CratesAsync(
        IReadOnlyCollection<int> crateIds,
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerCrates.AsNoTracking()
            .Where(crate => crateIds.Contains(crate.Id))
            .Select(crate => new CrateState(
                crate.Id,
                crate.BeerPotId,
                crate.EnteredByPersonId,
                crate.BookedAt,
                crate.UndoneAt
            ))
            .ToListAsync(ct);

    private Task<bool> HasEnrollmentHistoryAsync(int personId, CancellationToken ct) =>
        _dbContext
            .BeerListEnrollments.AsNoTracking()
            .AnyAsync(enrollment => enrollment.PersonId == personId, ct);

    private sealed record CrateEntry(
        int BeerPotId,
        int PersonId,
        int Count,
        int? EnteredByPersonId
    );

    private sealed record CrateState(
        int Id,
        int BeerPotId,
        int? EnteredByPersonId,
        DateTimeOffset BookedAt,
        DateTimeOffset? UndoneAt
    );

    private sealed record TabRow(BeerTabPotDetails Pot, BeerTabCrateSummary Crate);
}
