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
    private const string PaidCrateMessage =
        "Diese Kiste ist schon bezahlt und lässt sich nicht mehr zurücknehmen.";
    private const string UndoWindowClosedMessage =
        "Eine Kiste lässt sich nur direkt nach dem Buchen zurücknehmen. Später korrigiert sie der Getränkewart.";

    private readonly AppDbContext _dbContext;
    private readonly BeerPaymentService _beerPaymentService;
    private readonly TimeProvider _timeProvider;

    public BeerTabService(
        AppDbContext dbContext,
        BeerPaymentService beerPaymentService,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _beerPaymentService = beerPaymentService;
        _timeProvider = timeProvider;
    }

    public async Task<Result<BeerCrateBookingDetails>> BookOwnCratesAsync(
        int personId,
        int count,
        CancellationToken ct
    )
    {
        if (await OpenPotIdAsync(ct) is not { } openPotId)
            return Result<BeerCrateBookingDetails>.Conflict(NoOpenPotMessage);

        var booked = await BookAsync(
            new CrateEntry(openPotId, personId, count, personId, false),
            ct
        );
        if (booked.IsSuccess)
            return booked;

        return await OpenPotIdAsync(ct) is { } successorPotId && successorPotId != openPotId
            ? await BookAsync(new CrateEntry(successorPotId, personId, count, personId, false), ct)
            : booked;
    }

    public async Task<Result<BeerCrateBookingDetails>> BookCratesForAsync(
        BeerCratesForCommand command,
        CancellationToken ct
    )
    {
        if (!await _dbContext.People.AsNoTracking().AnyAsync(p => p.Id == command.PersonId, ct))
            return Result<BeerCrateBookingDetails>.NotFound(UnknownPersonMessage);

        if (!await HasEnrollmentHistoryAsync(command.PersonId, ct))
            return Result<BeerCrateBookingDetails>.Validation(NeverEnrolledMessage);

        return await BookAsync(
            new CrateEntry(
                command.BeerPotId,
                command.PersonId,
                command.Count,
                command.EnteredByPersonId,
                command.Paid
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
        BeerPotLedger.OpenCrates(_dbContext).AnyAsync(crate => crate.PersonId == personId, ct);

    public async Task<BeerTabDetails> GetTabAsync(int personId, CancellationToken ct)
    {
        var crates = await TabCratesAsync(personId, ct);
        var potIds = crates.Select(crate => crate.BeerPotId).Distinct().ToList();
        var pots = await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => potIds.Contains(pot.Id))
            .OrderBy(pot => pot.ClosedAt != null)
            .ThenByDescending(pot => pot.OpenedAt)
            .Select(pot => new TabPot(
                pot.Id,
                pot.ClosedAt == null,
                pot.OpenedAt,
                pot.Owner == null
                    ? null
                    : new BeerListPerson
                    {
                        PersonId = pot.Owner.Id,
                        FirstName = pot.Owner.FirstName,
                        LastName = pot.Owner.LastName,
                    },
                pot.PaymentLink
            ))
            .ToListAsync(ct);

        return new BeerTabDetails { Pots = [.. pots.Select(pot => PotOf(pot, crates))] };
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
    private static BeerTabPotDetails PotOf(TabPot pot, IReadOnlyList<TabCrate> crates)
    {
        var crateSummaries = crates
            .Where(crate => crate.BeerPotId == pot.BeerPotId)
            .Select(crate => crate.Summary)
            .ToList();
        var open = crateSummaries.Where(crate => crate.PaidAt is null).ToList();
        var paid = crateSummaries.Where(crate => crate.PaidAt is not null).ToList();

        return new BeerTabPotDetails
        {
            BeerPotId = pot.BeerPotId,
            IsOpen = pot.IsOpen,
            OpenedAt = pot.OpenedAt,
            Owner = pot.Owner,
            PaymentLink = pot.PaymentLink,
            OpenCrates = open.Count,
            OpenCents = open.Sum(crate => crate.PriceCents),
            PaidCrates = paid.Count,
            PaidCents = paid.Sum(crate => crate.PriceCents),
            Crates = crateSummaries,
        };
    }

    private async Task<IReadOnlyList<TabCrate>> TabCratesAsync(
        int personId,
        CancellationToken ct
    ) =>
        await BeerPotLedger
            .TakenCrates(_dbContext)
            .Where(crate => crate.PersonId == personId)
            .OrderByDescending(crate => crate.BookedAt)
            .ThenByDescending(crate => crate.Id)
            .Select(crate => new TabCrate(
                crate.BeerPotId,
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
                    PaidAt =
                        crate.PaidByPayment == null
                            ? null
                            : (DateTimeOffset?)crate.PaidByPayment.BookedAt,
                }
            ))
            .ToListAsync(ct);

    private async Task<Result<BeerCrateBookingDetails>> BookAsync(
        CrateEntry entry,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pot = await BeerPotLedger
            .LockedPot(_dbContext, entry.BeerPotId)
            .Select(row => new { row.ClosedAt, row.CratePriceCents })
            .SingleOrDefaultAsync(ct);
        if (pot is null)
            return Result<BeerCrateBookingDetails>.NotFound(BeerListMessages.UnknownPot);

        if (pot.ClosedAt is not null)
            return Result<BeerCrateBookingDetails>.Conflict(ClosedPotMessage);

        if (await BeerPotLedger.StockOfAsync(_dbContext, entry.BeerPotId, ct) < entry.Count)
            return Result<BeerCrateBookingDetails>.Conflict(BelowZeroMessage);

        var now = _timeProvider.GetUtcNow();
        var crates = NewCrates(entry, pot.CratePriceCents, now);
        _dbContext.BeerCrates.AddRange(crates);
        await _dbContext.SaveChangesAsync(ct);
        int? beerPaymentId = null;
        if (entry.Paid)
        {
            var payment = await PayBookedCratesAsync(entry, ct);
            if (!payment.IsSuccess)
                return Result<BeerCrateBookingDetails>.Conflict(payment.Error.Message);

            beerPaymentId = payment.Value.BeerPaymentId;
        }

        await transaction.CommitAsync(ct);

        return Result<BeerCrateBookingDetails>.Success(
            new BeerCrateBookingDetails
            {
                CrateIds = [.. crates.Select(crate => crate.Id)],
                UndoableUntil = now + BeerCrate.UndoWindow,
                BeerPaymentId = beerPaymentId,
            }
        );
    }

    private Task<Result<BeerPaymentDetails>> PayBookedCratesAsync(
        CrateEntry entry,
        CancellationToken ct
    ) =>
        _beerPaymentService.PayUnderPotLockAsync(
            new BeerPaymentCommand
            {
                BeerPotId = entry.BeerPotId,
                PersonId = entry.PersonId,
                Crates = entry.Count,
                BookedByPersonId = entry.EnteredByPersonId,
            },
            ct
        );

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

        if (crates.Any(crate => crate.IsPaid))
            return Result.Conflict(PaidCrateMessage);

        var crateIds = crates.Select(crate => crate.Id).ToList();
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await LockOpenPotsAsync(crates, ct))
            return Result.Conflict(ClosedPotMessage);

        var undone = await _dbContext
            .BeerCrates.Where(crate =>
                crateIds.Contains(crate.Id)
                && crate.UndoneAt == null
                && crate.PaidByPaymentId == null
            )
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(crate => crate.UndoneAt, now)
                        .SetProperty(crate => crate.UndoneByPersonId, undoneByPersonId),
                ct
            );
        if (undone != crateIds.Count)
            return Result.Conflict(
                (await CratesAsync(crateIds, ct)).Any(crate => crate.IsPaid)
                    ? PaidCrateMessage
                    : UndoneCrateMessage
            );

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
                crate.UndoneAt,
                crate.PaidByPaymentId != null
            ))
            .ToListAsync(ct);

    private Task<int?> OpenPotIdAsync(CancellationToken ct) =>
        _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => pot.ClosedAt == null)
            .Select(pot => (int?)pot.Id)
            .SingleOrDefaultAsync(ct);

    private Task<bool> HasEnrollmentHistoryAsync(int personId, CancellationToken ct) =>
        _dbContext
            .BeerListEnrollments.AsNoTracking()
            .AnyAsync(enrollment => enrollment.PersonId == personId, ct);

    private sealed record CrateEntry(
        int BeerPotId,
        int PersonId,
        int Count,
        int? EnteredByPersonId,
        bool Paid
    );

    private sealed record CrateState(
        int Id,
        int BeerPotId,
        int? EnteredByPersonId,
        DateTimeOffset BookedAt,
        DateTimeOffset? UndoneAt,
        bool IsPaid
    );

    private sealed record TabPot(
        int BeerPotId,
        bool IsOpen,
        DateTimeOffset OpenedAt,
        BeerListPerson? Owner,
        string? PaymentLink
    );

    private sealed record TabCrate(int BeerPotId, BeerTabCrateSummary Summary);
}
