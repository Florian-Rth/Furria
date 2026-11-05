using System.Diagnostics.Contracts;
using Furria.Application.Start;
using Furria.Infrastructure.BeerList;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    [Pure]
    private static StartBeerTabSummary BeerTabOf(OpenTabRow tab, BeerTabPotRow pot) =>
        new()
        {
            BeerPotId = tab.BeerPotId,
            PotIsOpen = pot.IsOpen,
            OpenCrates = tab.OpenCrates,
            OpenCents = tab.OpenCents,
            OldestOpenBookedAt = tab.OldestOpenBookedAt,
            Owner = pot.Owner,
            PaymentLink = pot.PaymentLink,
        };

    private async Task<IReadOnlyList<StartBeerTabSummary>> OpenBeerTabsAsync(
        int personId,
        CancellationToken ct
    )
    {
        var tabs = await BeerPotLedger
            .OpenCrates(_dbContext)
            .Where(crate => crate.PersonId == personId)
            .GroupBy(crate => crate.BeerPotId)
            .Select(tab => new OpenTabRow(
                tab.Key,
                tab.Count(),
                tab.Sum(crate => crate.PriceCents),
                tab.Min(crate => crate.BookedAt)
            ))
            .ToListAsync(ct);
        if (tabs.Count == 0)
            return [];

        var potIds = tabs.Select(tab => tab.BeerPotId).ToList();
        var pots = await _dbContext
            .BeerPots.AsNoTracking()
            .Where(pot => potIds.Contains(pot.Id))
            .Select(pot => new BeerTabPotRow(
                pot.Id,
                pot.ClosedAt == null,
                pot.Owner == null
                    ? null
                    : new StartPersonRef
                    {
                        PersonId = pot.Owner.Id,
                        FirstName = pot.Owner.FirstName,
                        LastName = pot.Owner.LastName,
                    },
                pot.PaymentLink
            ))
            .ToDictionaryAsync(pot => pot.BeerPotId, ct);

        return [.. tabs.Select(tab => BeerTabOf(tab, pots[tab.BeerPotId]))];
    }

    private sealed record OpenTabRow(
        int BeerPotId,
        int OpenCrates,
        int OpenCents,
        DateTimeOffset OldestOpenBookedAt
    );

    private sealed record BeerTabPotRow(
        int BeerPotId,
        bool IsOpen,
        StartPersonRef? Owner,
        string? PaymentLink
    );
}
