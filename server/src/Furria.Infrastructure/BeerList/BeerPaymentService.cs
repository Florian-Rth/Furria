using System.Diagnostics.Contracts;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerPaymentService
{
    private const string MoreThanOpenMessage =
        "So viele offene Kisten stehen auf diesem Deckel nicht. Bezahlt werden nur ganze, offene Kisten.";
    private const string UnknownPaymentMessage = "Diese Zahlung gibt es nicht.";
    private const string UndonePaymentMessage = "Diese Zahlung ist schon zurückgenommen.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BeerPaymentService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result<BeerPaymentDetails>> PayAsync(
        BeerPaymentCommand command,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (!await BeerPotLedger.LockedPot(_dbContext, command.BeerPotId).AnyAsync(ct))
            return Result<BeerPaymentDetails>.NotFound(BeerListMessages.UnknownPot);

        var settled = await OldestOpenCratesAsync(command, ct);
        if (settled.Count < command.Crates)
            return Result<BeerPaymentDetails>.Conflict(MoreThanOpenMessage);

        var payment = NewPayment(command, settled, _timeProvider.GetUtcNow());
        _dbContext.BeerPayments.Add(payment);
        await _dbContext.SaveChangesAsync(ct);
        await SettleAsync(settled, payment.Id, ct);
        await transaction.CommitAsync(ct);

        return Result<BeerPaymentDetails>.Success(
            new BeerPaymentDetails
            {
                BeerPaymentId = payment.Id,
                Crates = payment.Crates,
                AmountCents = payment.AmountCents,
            }
        );
    }

    public async Task<Result> UndoAsync(
        int beerPaymentId,
        int? undoneByPersonId,
        CancellationToken ct
    )
    {
        var beerPotId = await _dbContext
            .BeerPayments.AsNoTracking()
            .Where(payment => payment.Id == beerPaymentId)
            .Select(payment => (int?)payment.BeerPotId)
            .SingleOrDefaultAsync(ct);
        if (beerPotId is null)
            return Result.NotFound(UnknownPaymentMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await BeerPotLedger.LockedPot(_dbContext, beerPotId.Value).AnyAsync(ct);
        var undone = await _dbContext
            .BeerPayments.Where(payment => payment.Id == beerPaymentId && payment.UndoneAt == null)
            .ExecuteUpdateAsync(
                row =>
                    row.SetProperty(payment => payment.UndoneAt, _timeProvider.GetUtcNow())
                        .SetProperty(payment => payment.UndoneByPersonId, undoneByPersonId),
                ct
            );
        if (undone == 0)
            return Result.Conflict(UndonePaymentMessage);

        await _dbContext
            .BeerCrates.Where(crate => crate.PaidByPaymentId == beerPaymentId)
            .ExecuteUpdateAsync(
                row => row.SetProperty(crate => crate.PaidByPaymentId, (int?)null),
                ct
            );
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result<IReadOnlyList<BeerPotTabSummary>>> GetTabsAsync(
        int beerPotId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.BeerPots.AsNoTracking().AnyAsync(pot => pot.Id == beerPotId, ct))
            return Result<IReadOnlyList<BeerPotTabSummary>>.NotFound(BeerListMessages.UnknownPot);

        var tallies = await TalliesAsync(beerPotId, ct);
        var personIds = tallies.Select(tally => tally.Person.PersonId).ToList();
        var enrolled = await RunningEnrolleesAsync(personIds, ct);
        var payments = await StandingPaymentsAsync(beerPotId, ct);

        return Result<IReadOnlyList<BeerPotTabSummary>>.Success([
            .. tallies.Select(tally => TabOf(tally, enrolled, payments)),
        ]);
    }

    [Pure]
    private static BeerPayment NewPayment(
        BeerPaymentCommand command,
        IReadOnlyList<OpenCrate> settled,
        DateTimeOffset bookedAt
    ) =>
        new()
        {
            BeerPotId = command.BeerPotId,
            PersonId = command.PersonId,
            Crates = settled.Count,
            AmountCents = settled.Sum(crate => crate.PriceCents),
            BookedByPersonId = command.BookedByPersonId,
            BookedAt = bookedAt,
        };

    [Pure]
    private static BeerPotTabSummary TabOf(
        TabTally tally,
        IReadOnlySet<int> enrolled,
        IReadOnlyList<PaymentRow> payments
    ) =>
        new()
        {
            Person = tally.Person,
            IsEnrolled = enrolled.Contains(tally.Person.PersonId),
            OpenCrates = tally.OpenCrates,
            OpenCents = tally.OpenCents,
            PaidCrates = tally.PaidCrates,
            PaidCents = tally.PaidCents,
            OldestOpenBookedAt = tally.OldestOpenBookedAt,
            Payments =
            [
                .. payments
                    .Where(payment => payment.PersonId == tally.Person.PersonId)
                    .Select(payment => payment.Summary),
            ],
        };

    private async Task<IReadOnlyList<OpenCrate>> OldestOpenCratesAsync(
        BeerPaymentCommand command,
        CancellationToken ct
    ) =>
        await BeerPotLedger
            .TakenCrates(_dbContext)
            .Where(crate =>
                crate.BeerPotId == command.BeerPotId
                && crate.PersonId == command.PersonId
                && crate.PaidByPaymentId == null
            )
            .OrderBy(crate => crate.BookedAt)
            .ThenBy(crate => crate.Id)
            .Take(command.Crates)
            .Select(crate => new OpenCrate(crate.Id, crate.PriceCents))
            .ToListAsync(ct);

    private async Task SettleAsync(
        IReadOnlyList<OpenCrate> settled,
        int beerPaymentId,
        CancellationToken ct
    )
    {
        var crateIds = settled.Select(crate => crate.Id).ToList();
        await _dbContext
            .BeerCrates.Where(crate => crateIds.Contains(crate.Id))
            .ExecuteUpdateAsync(
                row => row.SetProperty(crate => crate.PaidByPaymentId, beerPaymentId),
                ct
            );
    }

    private async Task<IReadOnlyList<TabTally>> TalliesAsync(int beerPotId, CancellationToken ct) =>
        await BeerPotLedger
            .TakenCrates(_dbContext)
            .Where(crate => crate.BeerPotId == beerPotId && crate.PersonId != null)
            .GroupBy(crate => new
            {
                PersonId = crate.PersonId!.Value,
                crate.Person!.FirstName,
                crate.Person.LastName,
            })
            .OrderBy(tab => EF.Functions.Collate(tab.Key.LastName, GermanCollation.Name))
            .ThenBy(tab => EF.Functions.Collate(tab.Key.FirstName, GermanCollation.Name))
            .ThenBy(tab => tab.Key.PersonId)
            .Select(tab => new TabTally(
                new BeerListPerson
                {
                    PersonId = tab.Key.PersonId,
                    FirstName = tab.Key.FirstName,
                    LastName = tab.Key.LastName,
                },
                tab.Count(crate => crate.PaidByPaymentId == null),
                tab.Where(crate => crate.PaidByPaymentId == null).Sum(crate => crate.PriceCents),
                tab.Count(crate => crate.PaidByPaymentId != null),
                tab.Where(crate => crate.PaidByPaymentId != null).Sum(crate => crate.PriceCents),
                tab.Where(crate => crate.PaidByPaymentId == null)
                    .Min(crate => (DateTimeOffset?)crate.BookedAt)
            ))
            .ToListAsync(ct);

    private async Task<IReadOnlySet<int>> RunningEnrolleesAsync(
        IReadOnlyList<int> personIds,
        CancellationToken ct
    ) =>
        (
            await _dbContext
                .BeerListEnrollments.AsNoTracking()
                .Where(enrollment =>
                    personIds.Contains(enrollment.PersonId) && enrollment.EndedAt == null
                )
                .Select(enrollment => enrollment.PersonId)
                .ToListAsync(ct)
        ).ToHashSet();

    private async Task<IReadOnlyList<PaymentRow>> StandingPaymentsAsync(
        int beerPotId,
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerPayments.AsNoTracking()
            .Where(payment =>
                payment.BeerPotId == beerPotId
                && payment.UndoneAt == null
                && payment.PersonId != null
            )
            .OrderByDescending(payment => payment.BookedAt)
            .ThenByDescending(payment => payment.Id)
            .Select(payment => new PaymentRow(
                payment.PersonId!.Value,
                new BeerPaymentSummary
                {
                    BeerPaymentId = payment.Id,
                    Crates = payment.Crates,
                    AmountCents = payment.AmountCents,
                    BookedAt = payment.BookedAt,
                    BookedBy =
                        payment.BookedBy == null
                            ? null
                            : new BeerListPerson
                            {
                                PersonId = payment.BookedBy.Id,
                                FirstName = payment.BookedBy.FirstName,
                                LastName = payment.BookedBy.LastName,
                            },
                }
            ))
            .ToListAsync(ct);

    private sealed record OpenCrate(int Id, int PriceCents);

    private sealed record TabTally(
        BeerListPerson Person,
        int OpenCrates,
        int OpenCents,
        int PaidCrates,
        int PaidCents,
        DateTimeOffset? OldestOpenBookedAt
    );

    private sealed record PaymentRow(int PersonId, BeerPaymentSummary Summary);
}
