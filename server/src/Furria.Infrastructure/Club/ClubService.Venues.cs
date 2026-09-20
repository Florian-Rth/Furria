using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private static readonly Expression<Func<Venue, VenueRow>> VenueProjection =
        venue => new VenueRow(venue.Id, venue.Name, venue.SortOrder);

    private static readonly Expression<Func<KeyHolding, KeyHoldingRow>> KeyHoldingProjection =
        holding => new KeyHoldingRow(
            holding.VenueId,
            holding.PersonId,
            holding.Person!.FirstName,
            holding.Person!.LastName,
            holding.Person!.PortraitUrl,
            holding.SinceOn
        );

    private async Task<IReadOnlyList<ClubHubVenue>> VenuesAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var venues = await _dbContext
            .Venues.AsNoTracking()
            .Where(venue => venue.ArchivedOn == null)
            .OrderBy(venue => venue.SortOrder)
            .ThenBy(venue => EF.Functions.Collate(venue.Name, GermanCollation.Name))
            .ThenBy(venue => venue.Id)
            .Select(VenueProjection)
            .ToListAsync(ct);

        if (venues.Count == 0)
            return [];

        var holdings = await _dbContext
            .KeyHoldings.AsNoTracking()
            .Where(holding =>
                holding.SinceOn <= today && (holding.UntilOn == null || holding.UntilOn >= today)
            )
            .OrderBy(holding =>
                EF.Functions.Collate(holding.Person!.LastName, GermanCollation.Name)
            )
            .ThenBy(holding =>
                EF.Functions.Collate(holding.Person!.FirstName, GermanCollation.Name)
            )
            .ThenBy(holding => holding.PersonId)
            .ThenBy(holding => holding.SinceOn)
            .ThenBy(holding => holding.Id)
            .Select(KeyHoldingProjection)
            .ToListAsync(ct);

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(today, ct);

        var holdersByVenue = holdings
            .GroupBy(holding => holding.VenueId)
            .ToDictionary(byVenue => byVenue.Key, byVenue => ToHolders(byVenue, officeNames));

        return
        [
            .. venues.Select(venue => new ClubHubVenue
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                SortOrder = venue.SortOrder,
                Holders = holdersByVenue.TryGetValue(venue.VenueId, out var holders) ? holders : [],
            }),
        ];
    }

    [Pure]
    private static IReadOnlyList<ClubHubKeyHolder> ToHolders(
        IEnumerable<KeyHoldingRow> holdings,
        IReadOnlyDictionary<int, string> officeNames
    ) =>
        [
            .. holdings
                .GroupBy(holding => holding.PersonId)
                .Select(byPerson => byPerson.First())
                .Select(holding => new ClubHubKeyHolder
                {
                    Person = new ClubHubPerson
                    {
                        PersonId = holding.PersonId,
                        FirstName = holding.FirstName,
                        LastName = holding.LastName,
                        PortraitUrl = holding.PortraitUrl,
                        OfficeName = officeNames.GetValueOrDefault(holding.PersonId),
                    },
                    SinceOn = holding.SinceOn,
                }),
        ];

    private sealed record VenueRow(int VenueId, string Name, int SortOrder);

    private sealed record KeyHoldingRow(
        int VenueId,
        int PersonId,
        string FirstName,
        string LastName,
        string? PortraitUrl,
        DateOnly SinceOn
    );
}
