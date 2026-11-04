using Furria.Application.Start;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private async Task<IReadOnlyList<StartBeerTabSummary>> OpenBeerTabsAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        var personId = viewer.PersonId;
        var openCrates = _dbContext
            .BeerCrates.AsNoTracking()
            .Where(crate =>
                crate.PersonId == personId
                && crate.UndoneAt == null
                && crate.PaidByPaymentId == null
            );

        return await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => openCrates.Any(crate => crate.BeerPotId == pot.Id))
            .Select(pot => new StartBeerTabSummary
            {
                BeerPotId = pot.Id,
                PotIsOpen = pot.ClosedAt == null,
                OpenCrates = openCrates.Count(crate => crate.BeerPotId == pot.Id),
                OpenCents = openCrates
                    .Where(crate => crate.BeerPotId == pot.Id)
                    .Sum(crate => crate.PriceCents),
                OldestOpenBookedAt = openCrates
                    .Where(crate => crate.BeerPotId == pot.Id)
                    .Min(crate => crate.BookedAt),
                Owner =
                    pot.Owner == null
                        ? null
                        : new StartPersonRef
                        {
                            PersonId = pot.Owner.Id,
                            FirstName = pot.Owner.FirstName,
                            LastName = pot.Owner.LastName,
                        },
                PaymentLink = pot.PaymentLink,
                PaymentNote = pot.PaymentNote,
            })
            .ToListAsync(ct);
    }
}
