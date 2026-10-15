using System.Diagnostics.Contracts;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonHonoursQuery
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PersonHonoursQuery(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<PersonHonoursDetails> OfPersonAsync(int personId, CancellationToken ct) =>
        (await OfAsync([personId], ct)).Of(personId);

    public async Task<PersonHonoursLookup> OfAsync(IEnumerable<int> personIds, CancellationToken ct)
    {
        var candidates = personIds.Distinct().ToList();

        if (candidates.Count == 0)
            return new PersonHonoursLookup(new Dictionary<int, PersonHonoursDetails>());

        var today = ClubClock.Today(_timeProvider);
        var memberships = await MembershipsAsync(candidates, ct);
        var seats = await BoardSeatsAsync(candidates, today, ct);
        var tenures = await GroupAdminsAsync(candidates, today, ct);
        var holdings = await RoleHoldingsAsync(candidates, today, ct);

        return new PersonHonoursLookup(
            candidates.ToDictionary(
                personId => personId,
                personId =>
                    HonoursOf(
                        memberships[personId],
                        [.. seats[personId], .. tenures[personId], .. holdings[personId]],
                        ClubSession.RelevantYearOf(today)
                    )
            )
        );
    }

    private async Task<ILookup<int, MembershipRow>> MembershipsAsync(
        IReadOnlyList<int> personIds,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .Memberships.AsNoTracking()
            .Where(membership => personIds.Contains(membership.PersonId))
            .Select(membership => new MembershipRow(
                membership.PersonId,
                membership.StartedOn,
                membership.EndedOn,
                membership
                    .Pauses.Select(pause => new PauseRow(
                        pause.FirstSessionYear,
                        pause.LastSessionYear
                    ))
                    .ToList()
            ))
            .ToListAsync(ct);

        return rows.ToLookup(row => row.PersonId);
    }

    private async Task<ILookup<int, PersonFunctionDetails>> BoardSeatsAsync(
        IReadOnlyList<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .BoardSeats.AsNoTracking()
            .Where(Conferring.BoardSeats(today))
            .Where(seat => personIds.Contains(seat.PersonId) && seat.BoardOffice!.IsPublic)
            .OrderBy(seat => seat.BoardOffice!.SortOrder)
            .ThenBy(seat => seat.BoardOffice!.Name)
            .ThenBy(seat => seat.BoardOfficeId)
            .Select(seat => new FunctionRow(
                seat.PersonId,
                seat.BoardOffice!.Name,
                seat.BoardOffice!.Icon,
                null
            ))
            .ToListAsync(ct);

        return ToFunctions(rows, PersonFunctionKind.BoardSeat);
    }

    private async Task<ILookup<int, PersonFunctionDetails>> GroupAdminsAsync(
        IReadOnlyList<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .GroupAdmins.AsNoTracking()
            .Where(Conferring.GroupAdmins(today))
            .Where(tenure => personIds.Contains(tenure.PersonId))
            .OrderBy(tenure => tenure.SinceOn)
            .ThenBy(tenure => tenure.Id)
            .Select(tenure => new FunctionRow(
                tenure.PersonId,
                tenure.Group!.Name,
                tenure.Group!.Icon,
                tenure.Group!.Tone
            ))
            .ToListAsync(ct);

        return ToFunctions(rows, PersonFunctionKind.GroupAdmin);
    }

    private async Task<ILookup<int, PersonFunctionDetails>> RoleHoldingsAsync(
        IReadOnlyList<int> personIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .RoleHoldings.AsNoTracking()
            .Where(Conferring.RoleHoldings(today))
            .Where(holding => personIds.Contains(holding.PersonId))
            .OrderBy(holding => holding.SinceOn)
            .ThenBy(holding => holding.Id)
            .Select(holding => new FunctionRow(
                holding.PersonId,
                holding.Role!.Name,
                holding.Role!.Icon,
                null
            ))
            .ToListAsync(ct);

        return ToFunctions(rows, PersonFunctionKind.Role);
    }

    [Pure]
    private static ILookup<int, PersonFunctionDetails> ToFunctions(
        IReadOnlyList<FunctionRow> rows,
        PersonFunctionKind kind
    ) =>
        rows.ToLookup(
            row => row.PersonId,
            row => new PersonFunctionDetails
            {
                Kind = kind,
                Name = row.Name,
                Icon = row.Icon,
                Tone = row.Tone,
            }
        );

    [Pure]
    private static PersonHonoursDetails HonoursOf(
        IEnumerable<MembershipRow> memberships,
        IReadOnlyList<PersonFunctionDetails> functions,
        int sessionYear
    )
    {
        var periods = memberships.ToList();

        return new PersonHonoursDetails
        {
            Sessions = SessionCount.Of(
                [.. periods.Select(period => period.AsPeriod)],
                [.. periods.SelectMany(period => period.Pauses).Select(pause => pause.AsSpan)],
                sessionYear
            ),
            Functions = functions,
        };
    }

    private sealed record MembershipRow(
        int PersonId,
        DateOnly StartedOn,
        DateOnly? EndedOn,
        IReadOnlyList<PauseRow> Pauses
    )
    {
        [Pure]
        public DatePeriod AsPeriod => new() { Start = StartedOn, End = EndedOn };
    }

    private sealed record PauseRow(int FirstSessionYear, int? LastSessionYear)
    {
        [Pure]
        public SessionSpan AsSpan =>
            new() { FirstYear = FirstSessionYear, LastYear = LastSessionYear };
    }

    private sealed record FunctionRow(int PersonId, string Name, ClubIcon? Icon, GroupTone? Tone);
}
