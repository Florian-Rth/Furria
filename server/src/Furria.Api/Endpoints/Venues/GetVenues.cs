using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class GetVenues : EndpointWithoutRequest<GetVenuesResponse>
{
    private readonly VenueService _venueService;

    public GetVenues(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Get("manage/venues");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var venues = await _venueService.GetVenuesAsync(ct);

        await Send.OkAsync(ToResponse(venues), cancellation: ct);
    }

    private static GetVenuesResponse ToResponse(IReadOnlyList<VenueSummary> venues) =>
        new() { Venues = [.. venues.Select(ToDto)] };

    private static VenueSummaryDto ToDto(VenueSummary venue) =>
        new()
        {
            VenueId = venue.VenueId,
            Name = venue.Name,
            Street = venue.Street,
            Zip = venue.Zip,
            City = venue.City,
            Hint = venue.Hint,
            ArchivedOn = venue.ArchivedOn,
        };
}

public sealed record GetVenuesResponse
{
    public required IReadOnlyList<VenueSummaryDto> Venues { get; init; }
}

public sealed record VenueSummaryDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }

    public required DateOnly? ArchivedOn { get; init; }
}
