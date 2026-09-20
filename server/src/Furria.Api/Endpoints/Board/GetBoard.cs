using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

public sealed class GetBoard : EndpointWithoutRequest<GetBoardResponse>
{
    private readonly BoardService _boardService;

    public GetBoard(BoardService boardService)
    {
        _boardService = boardService;
    }

    public override void Configure()
    {
        Get("manage/board");
        Definition.RequirePermission(FurriaPermissions.BoardManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var offices = await _boardService.GetBoardAsync(ct);

        await Send.OkAsync(ToResponse(offices), cancellation: ct);
    }

    private static GetBoardResponse ToResponse(IReadOnlyList<BoardOfficeDetails> offices) =>
        new() { Offices = [.. offices.Select(ToDto)] };

    private static BoardOfficeDto ToDto(BoardOfficeDetails office) =>
        new()
        {
            BoardOfficeId = office.BoardOfficeId,
            Name = office.Name,
            SortOrder = office.SortOrder,
            ImpliedRoleId = office.ImpliedRoleId,
            ImpliedRoleName = office.ImpliedRoleName,
            ArchivedOn = office.ArchivedOn,
            Seats = [.. office.Seats.Select(ToDto)],
            PastSeats = [.. office.PastSeats.Select(ToDto)],
        };

    private static BoardSeatDto ToDto(BoardSeatHolder seat) =>
        new()
        {
            BoardSeatId = seat.BoardSeatId,
            PersonId = seat.PersonId,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            SinceOn = seat.SinceOn,
            UntilOn = seat.UntilOn,
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

    public required int? ImpliedRoleId { get; init; }

    public required string? ImpliedRoleName { get; init; }

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
}
