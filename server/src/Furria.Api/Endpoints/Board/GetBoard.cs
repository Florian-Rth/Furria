using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Honours;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Board;

public sealed class GetBoard : EndpointWithoutRequest<GetBoardResponse>
{
    private readonly BoardService _boardService;
    private readonly PersonHonoursQuery _honoursQuery;

    public GetBoard(BoardService boardService, PersonHonoursQuery honoursQuery)
    {
        _boardService = boardService;
        _honoursQuery = honoursQuery;
    }

    public override void Configure()
    {
        Get("manage/board");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var offices = await _boardService.GetBoardAsync(ct);
        var honours = await _honoursQuery.OfAsync(HoldersOf(offices), ct);

        await Send.OkAsync(ToResponse(offices, honours), cancellation: ct);
    }

    private static IEnumerable<int> HoldersOf(IReadOnlyList<BoardOfficeDetails> offices) =>
        offices
            .SelectMany(office => office.Seats.Concat(office.PastSeats))
            .Select(seat => seat.PersonId);

    private static GetBoardResponse ToResponse(
        IReadOnlyList<BoardOfficeDetails> offices,
        PersonHonoursLookup honours
    ) => new() { Offices = [.. offices.Select(office => ToDto(office, honours))] };

    private static BoardOfficeDto ToDto(BoardOfficeDetails office, PersonHonoursLookup honours) =>
        new()
        {
            BoardOfficeId = office.BoardOfficeId,
            Name = office.Name,
            SortOrder = office.SortOrder,
            Icon = office.Icon,
            ImpliedRoleId = office.ImpliedRoleId,
            ImpliedRoleName = office.ImpliedRoleName,
            IsPublic = office.IsPublic,
            ArchivedOn = office.ArchivedOn,
            Seats = [.. office.Seats.Select(seat => ToDto(seat, honours))],
            PastSeats = [.. office.PastSeats.Select(seat => ToDto(seat, honours))],
        };

    private static BoardSeatDto ToDto(BoardSeatHolder seat, PersonHonoursLookup honours) =>
        new()
        {
            BoardSeatId = seat.BoardSeatId,
            PersonId = seat.PersonId,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            SinceOn = seat.SinceOn,
            UntilOn = seat.UntilOn,
            Honours = PersonHonoursDto.From(honours.Of(seat.PersonId)),
        };
}

public sealed record GetBoardResponse
{
    public required IReadOnlyList<BoardOfficeDto> Offices { get; init; }
}

public sealed record BoardOfficeDto
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required ClubIcon? Icon { get; init; }

    public required int? ImpliedRoleId { get; init; }

    public required string? ImpliedRoleName { get; init; }

    public required bool IsPublic { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<BoardSeatDto> Seats { get; init; }

    public required IReadOnlyList<BoardSeatDto> PastSeats { get; init; }
}

public sealed record BoardSeatDto
{
    public required int BoardSeatId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required PersonHonoursDto Honours { get; init; }
}
