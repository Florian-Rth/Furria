using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class RunningBoardSeats
{
    private static readonly Expression<Func<BoardSeat, RunningBoardSeat>> SeatProjection =
        seat => new RunningBoardSeat(
            seat.PersonId,
            seat.Person!.FirstName,
            seat.Person!.LastName,
            seat.Person!.PortraitUrl,
            seat.BoardOffice!.Name,
            seat.BoardOffice!.SortOrder
        );

    private readonly AppDbContext _dbContext;

    private DateOnly? _readFor;
    private IReadOnlyList<RunningBoardSeat> _seats = [];

    public RunningBoardSeats(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<RunningBoardSeat>> SeatsAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        if (_readFor == today)
            return _seats;

        _seats = await _dbContext
            .BoardSeats.AsNoTracking()
            .Where(seat => seat.SinceOn <= today && (seat.UntilOn == null || seat.UntilOn >= today))
            .OrderBy(seat => seat.BoardOffice!.SortOrder)
            .ThenBy(seat => EF.Functions.Collate(seat.Person!.LastName, GermanCollation.Name))
            .ThenBy(seat => EF.Functions.Collate(seat.Person!.FirstName, GermanCollation.Name))
            .ThenBy(seat => seat.PersonId)
            .Select(SeatProjection)
            .ToListAsync(ct);
        _readFor = today;

        return _seats;
    }

    public async Task<IReadOnlyDictionary<int, string>> OfficeNamesAsync(
        DateOnly today,
        CancellationToken ct
    ) => ToOfficeNames(await SeatsAsync(today, ct));

    [Pure]
    private static IReadOnlyDictionary<int, string> ToOfficeNames(
        IReadOnlyList<RunningBoardSeat> seats
    ) => seats.GroupBy(seat => seat.PersonId).ToDictionary(held => held.Key, FirstBySortOrder);

    [Pure]
    private static string FirstBySortOrder(IEnumerable<RunningBoardSeat> held) =>
        held.OrderBy(seat => seat.SortOrder)
            .ThenBy(seat => seat.OfficeName, StringComparer.Ordinal)
            .First()
            .OfficeName;
}

public sealed record RunningBoardSeat(
    int PersonId,
    string FirstName,
    string LastName,
    string? PortraitUrl,
    string OfficeName,
    int SortOrder
);
