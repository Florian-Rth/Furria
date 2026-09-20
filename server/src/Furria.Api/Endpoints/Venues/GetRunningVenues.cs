using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class GetRunningVenues : EndpointWithoutRequest<GetRunningVenuesResponse>
{
    private readonly VenueService _venueService;

    public GetRunningVenues(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Get("venues");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var venues = await _venueService.GetRunningVenuesAsync(ct);

        await Send.OkAsync(ToResponse(venues), cancellation: ct);
    }

    private static GetRunningVenuesResponse ToResponse(IReadOnlyList<RunningVenueSummary> venues) =>
        new() { Venues = [.. venues.Select(ToDto)] };

    private static RunningVenueSummaryDto ToDto(RunningVenueSummary venue) =>
        new() { VenueId = venue.VenueId, Name = venue.Name };
}

public sealed record GetRunningVenuesResponse
{
    public required IReadOnlyList<RunningVenueSummaryDto> Venues { get; init; }
}

public sealed record RunningVenueSummaryDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }
}
