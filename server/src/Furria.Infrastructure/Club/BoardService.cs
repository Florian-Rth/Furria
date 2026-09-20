using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class BoardService
{
    private const int NoBoardOfficeId = 0;
    private const string UnknownOfficeMessage = "Diese Vorstandsfunktion gibt es nicht.";
    private const string DuplicateNameMessage = WriteConflictMessages.DuplicateVorstandsfunktion;
    private const string ArchivedOfficeMessage =
        "Eine archivierte Vorstandsfunktion kann nicht bearbeitet werden.";
    private const string AlreadyArchivedMessage = "Diese Vorstandsfunktion ist bereits archiviert.";
    private const string NotArchivedMessage = "Diese Vorstandsfunktion ist nicht archiviert.";
    private const string OccupiedOfficeMessage =
        "Diese Vorstandsfunktion ist besetzt. Beende zuerst den Vorstandssitz.";
    private const string UnknownRoleMessage = "Diese Rolle gibt es nicht.";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle lässt sich einer Vorstandsfunktion nicht zuordnen.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string OpenSeatMessage = "Diese Person hat diese Vorstandsfunktion bereits inne.";
    private const string OverlappingSeatMessage =
        "Dieser Zeitraum überschneidet sich mit einem bestehenden Vorstandssitz. "
        + "Ein erneuter Vorstandssitz beginnt frühestens am Tag nach dem Ende des vorigen.";
    private const string UnknownSeatMessage =
        "Diesen Vorstandssitz gibt es bei dieser Vorstandsfunktion nicht.";
    private const string EndedSeatMessage = "Dieser Vorstandssitz ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Ein Vorstandssitz kann nicht vor seinem Beginn enden.";

    private static readonly Expression<Func<BoardOffice, OfficeRow>> OfficeProjection =
        office => new OfficeRow(
            office.Id,
            office.Name,
            office.SortOrder,
            office.ImpliedRoleId,
            office.ImpliedRole == null ? null : office.ImpliedRole.Name,
            office.ArchivedOn
        );

    private static readonly Expression<Func<BoardSeat, SeatRow>> SeatProjection =
        seat => new SeatRow(
            seat.Id,
            seat.BoardOfficeId,
            seat.PersonId,
            seat.Person!.FirstName,
            seat.Person!.LastName,
            seat.SinceOn,
            seat.UntilOn
        );

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public BoardService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<BoardOfficeDetails>> GetBoardAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var offices = await _dbContext
            .BoardOffices.AsNoTracking()
            .OrderBy(office => office.SortOrder)
            .ThenBy(office => office.Name)
            .ThenBy(office => office.Id)
            .Select(OfficeProjection)
            .ToListAsync(ct);

        var seats = await _dbContext
            .BoardSeats.AsNoTracking()
            .OrderByDescending(seat => seat.SinceOn)
            .ThenByDescending(seat => seat.Id)
            .Select(SeatProjection)
            .ToListAsync(ct);

        var seatsByOffice = seats.ToLookup(seat => seat.BoardOfficeId);

        return [.. offices.Select(office => ToDetails(office, seatsByOffice[office.Id], today))];
    }

    public Task<int?> ImpliedRoleIdOfAsync(int boardOfficeId, CancellationToken ct) =>
        _dbContext
            .BoardOffices.AsNoTracking()
            .Where(row => row.Id == boardOfficeId)
            .Select(row => row.ImpliedRoleId)
            .SingleOrDefaultAsync(ct);

    public async Task<Result<int>> CreateOfficeAsync(
        BoardOfficeCreateCommand command,
        CancellationToken ct
    )
    {
        if (await NameIsTakenAsync(command.Name, NoBoardOfficeId, ct))
            return Result<int>.Conflict(DuplicateNameMessage);

        var office = new BoardOffice { Name = command.Name, SortOrder = command.SortOrder };

        _dbContext.BoardOffices.Add(office);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(office.Id);
    }

    public async Task<Result> UpdateOfficeAsync(
        BoardOfficeUpdateCommand command,
        CancellationToken ct
    )
    {
        var office = await TrackedOfficeAsync(command.BoardOfficeId, ct);

        if (office is null)
            return Result.NotFound(UnknownOfficeMessage);

        if (office.ArchivedOn is not null)
            return Result.Conflict(ArchivedOfficeMessage);

        if (await NameIsTakenAsync(command.Name, command.BoardOfficeId, ct))
            return Result.Conflict(DuplicateNameMessage);

        office.Name = command.Name;
        office.SortOrder = command.SortOrder;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> SetImpliedRoleAsync(
        BoardOfficeImpliedRoleCommand command,
        CancellationToken ct
    )
    {
        var office = await TrackedOfficeAsync(command.BoardOfficeId, ct);

        if (office is null)
            return Result.NotFound(UnknownOfficeMessage);

        if (office.ArchivedOn is not null)
            return Result.Conflict(ArchivedOfficeMessage);

        if (command.ImpliedRoleId is { } roleId)
        {
            var role = await RoleStateAsync(roleId, ct);

            if (role is null)
                return Result.NotFound(UnknownRoleMessage);

            if (role.ArchivedOn is not null)
                return Result.Conflict(ArchivedRoleMessage);
        }

        office.ImpliedRoleId = command.ImpliedRoleId;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> ArchiveOfficeAsync(int boardOfficeId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);
        var office = await TrackedOfficeAsync(boardOfficeId, ct);

        if (office is null)
            return Result.NotFound(UnknownOfficeMessage);

        if (office.ArchivedOn is not null)
            return Result.Conflict(AlreadyArchivedMessage);

        if (await HasUnendedSeatAsync(boardOfficeId, today, ct))
            return Result.Conflict(OccupiedOfficeMessage);

        office.ArchivedOn = today;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreOfficeAsync(int boardOfficeId, CancellationToken ct)
    {
        var office = await TrackedOfficeAsync(boardOfficeId, ct);

        if (office is null)
            return Result.NotFound(UnknownOfficeMessage);

        if (office.ArchivedOn is null)
            return Result.Conflict(NotArchivedMessage);

        office.ArchivedOn = null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<int>> OpenSeatAsync(BoardSeatOpenCommand command, CancellationToken ct)
    {
        var office = await OfficeStateAsync(command.BoardOfficeId, ct);

        if (office is null)
            return Result<int>.NotFound(UnknownOfficeMessage);

        if (office.ArchivedOn is not null)
            return Result<int>.Conflict(ArchivedOfficeMessage);

        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var chain = await ChainOfAsync(command.BoardOfficeId, command.PersonId, ct);

        if (HasOpenRow(chain))
            return Result<int>.Conflict(OpenSeatMessage);

        if (OverlapsChain(chain, command.SinceOn))
            return Result<int>.Conflict(OverlappingSeatMessage);

        var seat = new BoardSeat
        {
            BoardOfficeId = command.BoardOfficeId,
            PersonId = command.PersonId,
            SinceOn = command.SinceOn,
        };

        _dbContext.BoardSeats.Add(seat);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(seat.Id);
    }

    public async Task<Result> EndSeatAsync(BoardSeatEndCommand command, CancellationToken ct)
    {
        var seat = await _dbContext.BoardSeats.SingleOrDefaultAsync(
            row => row.Id == command.BoardSeatId && row.BoardOfficeId == command.BoardOfficeId,
            ct
        );

        if (seat is null)
            return Result.NotFound(UnknownSeatMessage);

        if (seat.UntilOn is not null)
            return Result.Conflict(EndedSeatMessage);

        if (command.EndedOn < seat.SinceOn)
            return Result.Validation(EndBeforeStartMessage);

        seat.UntilOn = command.EndedOn;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private Task<BoardOffice?> TrackedOfficeAsync(int boardOfficeId, CancellationToken ct) =>
        _dbContext.BoardOffices.SingleOrDefaultAsync(row => row.Id == boardOfficeId, ct);

    private Task<OfficeState?> OfficeStateAsync(int boardOfficeId, CancellationToken ct) =>
        _dbContext
            .BoardOffices.AsNoTracking()
            .Where(row => row.Id == boardOfficeId)
            .Select(row => new OfficeState(row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private Task<RoleState?> RoleStateAsync(int roleId, CancellationToken ct) =>
        _dbContext
            .Roles.AsNoTracking()
            .Where(row => row.Id == roleId)
            .Select(row => new RoleState(row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private Task<bool> NameIsTakenAsync(string name, int exceptOfficeId, CancellationToken ct)
    {
        var lowered = name.ToLowerInvariant();

        return _dbContext
            .BoardOffices.AsNoTracking()
            .AnyAsync(row => row.Id != exceptOfficeId && row.Name.ToLower() == lowered, ct);
    }

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    private Task<bool> HasUnendedSeatAsync(
        int boardOfficeId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .BoardSeats.AsNoTracking()
            .AnyAsync(
                row =>
                    row.BoardOfficeId == boardOfficeId
                    && (row.UntilOn == null || row.UntilOn >= today),
                ct
            );

    private Task<List<PeriodRow>> ChainOfAsync(
        int boardOfficeId,
        int personId,
        CancellationToken ct
    ) =>
        _dbContext
            .BoardSeats.AsNoTracking()
            .Where(row => row.BoardOfficeId == boardOfficeId && row.PersonId == personId)
            .Select(row => new PeriodRow(row.SinceOn, row.UntilOn))
            .ToListAsync(ct);

    [Pure]
    private static bool HasOpenRow(IReadOnlyList<PeriodRow> chain) =>
        chain.Any(row => row.UntilOn is null);

    [Pure]
    private static bool OverlapsChain(IReadOnlyList<PeriodRow> chain, DateOnly sinceOn)
    {
        var opened = new DatePeriod { Start = sinceOn, End = null };

        return chain.Any(row => opened.Overlaps(row.AsPeriod));
    }

    [Pure]
    private static BoardOfficeDetails ToDetails(
        OfficeRow office,
        IEnumerable<SeatRow> seats,
        DateOnly today
    )
    {
        var held = seats.ToList();

        return new BoardOfficeDetails
        {
            BoardOfficeId = office.Id,
            Name = office.Name,
            SortOrder = office.SortOrder,
            ImpliedRoleId = office.ImpliedRoleId,
            ImpliedRoleName = office.ImpliedRoleName,
            ArchivedOn = office.ArchivedOn,
            Seats = [.. held.Where(seat => !IsOverOn(seat, today)).Select(ToHolder)],
            PastSeats = [.. held.Where(seat => IsOverOn(seat, today)).Select(ToHolder)],
        };
    }

    [Pure]
    private static bool IsOverOn(SeatRow seat, DateOnly today) =>
        seat.UntilOn is { } untilOn && untilOn < today;

    [Pure]
    private static BoardSeatHolder ToHolder(SeatRow seat) =>
        new()
        {
            BoardSeatId = seat.Id,
            PersonId = seat.PersonId,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            SinceOn = seat.SinceOn,
            UntilOn = seat.UntilOn,
        };

    private sealed record OfficeRow(
        int Id,
        string Name,
        int SortOrder,
        int? ImpliedRoleId,
        string? ImpliedRoleName,
        DateOnly? ArchivedOn
    );

    private sealed record SeatRow(
        int Id,
        int BoardOfficeId,
        int PersonId,
        string FirstName,
        string LastName,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );

    private sealed record OfficeState(DateOnly? ArchivedOn);

    private sealed record RoleState(DateOnly? ArchivedOn);

    private sealed record PeriodRow(DateOnly SinceOn, DateOnly? UntilOn)
    {
        [Pure]
        public DatePeriod AsPeriod => new() { Start = SinceOn, End = UntilOn };
    }
}
