using FastEndpoints;
using Furria.Api.Media;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Club;

public sealed class GetPublicBoard : EndpointWithoutRequest<GetPublicBoardResponse>
{
    private readonly ClubService _clubService;

    public GetPublicBoard(ClubService clubService)
    {
        _clubService = clubService;
    }

    public override void Configure()
    {
        Get("public/board");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var seats = await _clubService.GetPublicBoardAsync(ct);

        await Send.OkAsync(ToResponse(seats), cancellation: ct);
    }

    private static GetPublicBoardResponse ToResponse(IReadOnlyList<PublicBoardSeat> seats) =>
        new() { Seats = [.. seats.Select(ToDto)] };

    private static PublicBoardSeatDto ToDto(PublicBoardSeat seat) =>
        new()
        {
            OfficeName = seat.OfficeName,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            Portrait = PictureDto.From(seat.Portrait),
        };
}

public sealed record GetPublicBoardResponse
{
    public required IReadOnlyList<PublicBoardSeatDto> Seats { get; init; }
}

public sealed record PublicBoardSeatDto
{
    public required string OfficeName { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }
}
