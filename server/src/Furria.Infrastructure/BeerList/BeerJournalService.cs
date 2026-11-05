using System.Data;
using Furria.Application.BeerList;
using Furria.Application.Results;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerJournalService
{
    private readonly AppDbContext _dbContext;

    public BeerJournalService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<BeerJournalDetails>> GetJournalAsync(
        int beerPotId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.BeerPots.AsNoTracking().AnyAsync(pot => pot.Id == beerPotId, ct))
            return Result<BeerJournalDetails>.NotFound(BeerListMessages.UnknownPot);

        await using var snapshot = await _dbContext.Database.BeginTransactionAsync(
            IsolationLevel.RepeatableRead,
            ct
        );

        return Result<BeerJournalDetails>.Success(
            new BeerJournalDetails
            {
                Crates = await CratesAsync(beerPotId, ct),
                Payments = await PaymentsAsync(beerPotId, ct),
            }
        );
    }

    private async Task<IReadOnlyList<BeerJournalCrateSummary>> CratesAsync(
        int beerPotId,
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerCrates.AsNoTracking()
            .Where(crate => crate.BeerPotId == beerPotId)
            .OrderByDescending(crate => crate.BookedAt)
            .ThenByDescending(crate => crate.Id)
            .Select(crate => new BeerJournalCrateSummary
            {
                CrateId = crate.Id,
                Person =
                    crate.Person == null
                        ? null
                        : new BeerListPerson
                        {
                            PersonId = crate.Person.Id,
                            FirstName = crate.Person.FirstName,
                            LastName = crate.Person.LastName,
                        },
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
                UndoneAt = crate.UndoneAt,
                BeerPaymentId = crate.PaidByPaymentId,
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<BeerJournalPaymentSummary>> PaymentsAsync(
        int beerPotId,
        CancellationToken ct
    ) =>
        await _dbContext
            .BeerPayments.AsNoTracking()
            .Where(payment => payment.BeerPotId == beerPotId)
            .OrderByDescending(payment => payment.BookedAt)
            .ThenByDescending(payment => payment.Id)
            .Select(payment => new BeerJournalPaymentSummary
            {
                BeerPaymentId = payment.Id,
                Person =
                    payment.Person == null
                        ? null
                        : new BeerListPerson
                        {
                            PersonId = payment.Person.Id,
                            FirstName = payment.Person.FirstName,
                            LastName = payment.Person.LastName,
                        },
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
                UndoneAt = payment.UndoneAt,
            })
            .ToListAsync(ct);
}
