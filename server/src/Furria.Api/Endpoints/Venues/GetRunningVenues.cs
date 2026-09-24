using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class GetRunningVenues : EndpointWithoutRequest<GetRunningVenuesResponse>
{
    private readonly VenueService _venueService;
    private readonly PermissionAuthorizer _authorizer;

    public GetRunningVenues(VenueService venueService, PermissionAuthorizer authorizer)
    {
        _venueService = venueService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("venues");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.IsAffiliatedOrGroupAdminAsync(accountId.Value, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

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
