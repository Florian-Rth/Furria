using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class RestoreVenue : Endpoint<RestoreVenueRequest>
{
    private readonly VenueService _venueService;

    public RestoreVenue(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Post("manage/venues/{venueId}/restore");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(RestoreVenueRequest req, CancellationToken ct)
    {
        var result = await _venueService.RestoreAsync(req.VenueId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreVenueRequest
{
    [RouteParam]
    public required int VenueId { get; init; }
}

public sealed class RestoreVenueValidator : Validator<RestoreVenueRequest>
{
    public RestoreVenueValidator()
    {
        RuleFor(request => request.VenueId).GreaterThan(0);
    }
}
