using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private async Task<IReadOnlyList<ClubHubBoardSeat>> BoardAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var seats = await _dbContext
            .BoardSeats.AsNoTracking()
            .Where(seat => seat.SinceOn <= today && (seat.UntilOn == null || seat.UntilOn >= today))
            .OrderBy(seat => seat.BoardOffice!.SortOrder)
            .ThenBy(seat => EF.Functions.Collate(seat.Person!.LastName, GermanCollation.Name))
            .ThenBy(seat => EF.Functions.Collate(seat.Person!.FirstName, GermanCollation.Name))
            .ThenBy(seat => seat.PersonId)
            .Select(seat => new BoardSeatRow(
                seat.PersonId,
                seat.Person!.FirstName,
                seat.Person!.LastName,
                seat.Person!.PortraitUrl,
                seat.BoardOffice!.Name,
                seat.BoardOffice!.SortOrder
            ))
            .ToListAsync(ct);

        return [.. seats.Select(ToBoardSeat)];
    }

    private async Task<IReadOnlyDictionary<int, string>> RunningOfficeNamesAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var offices = await _dbContext
            .BoardSeats.AsNoTracking()
            .Where(seat => seat.SinceOn <= today && (seat.UntilOn == null || seat.UntilOn >= today))
            .Select(seat => new OfficeNameRow(
                seat.PersonId,
                seat.BoardOffice!.Name,
                seat.BoardOffice!.SortOrder
            ))
            .ToListAsync(ct);

        return offices
            .GroupBy(row => row.PersonId)
            .ToDictionary(held => held.Key, FirstBySortOrder);
    }

    [Pure]
    private static string FirstBySortOrder(IEnumerable<OfficeNameRow> held) =>
        held.OrderBy(row => row.SortOrder)
            .ThenBy(row => row.Name, StringComparer.Ordinal)
            .First()
            .Name;

    [Pure]
    private static ClubHubBoardSeat ToBoardSeat(BoardSeatRow seat) =>
        new()
        {
            Person = new ClubHubPerson
            {
                PersonId = seat.PersonId,
                FirstName = seat.FirstName,
                LastName = seat.LastName,
                PortraitUrl = seat.PortraitUrl,
                OfficeName = seat.OfficeName,
            },
            OfficeName = seat.OfficeName,
            SortOrder = seat.SortOrder,
        };

    private sealed record BoardSeatRow(
        int PersonId,
        string FirstName,
        string LastName,
        string? PortraitUrl,
        string OfficeName,
        int SortOrder
    );

    private sealed record OfficeNameRow(int PersonId, string Name, int SortOrder);
}
