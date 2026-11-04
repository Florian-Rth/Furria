using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class GetHalls : EndpointWithoutRequest<GetHallsResponse>
{
    private readonly HallService _hallService;

    public GetHalls(HallService hallService)
    {
        _hallService = hallService;
    }

    public override void Configure()
    {
        Get("halls");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var halls = await _hallService.GetHallsAsync(ct);

        await Send.OkAsync(
            new GetHallsResponse { Halls = [.. halls.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static HallSummaryDto ToDto(HallSummary hall) =>
        new()
        {
            HallId = hall.HallId,
            VenueId = hall.VenueId,
            VenueName = hall.VenueName,
            Name = hall.Name,
            UpdatedAt = hall.UpdatedAt,
        };
}

public sealed record GetHallsResponse
{
    public required IReadOnlyList<HallSummaryDto> Halls { get; init; }
}

public sealed record HallSummaryDto
{
    public required int HallId { get; init; }

    public required int VenueId { get; init; }

    public required string VenueName { get; init; }

    public required string Name { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }
}
