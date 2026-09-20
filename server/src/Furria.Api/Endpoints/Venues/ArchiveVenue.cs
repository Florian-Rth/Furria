using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class ArchiveVenue : Endpoint<ArchiveVenueRequest>
{
    private readonly VenueService _venueService;

    public ArchiveVenue(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Post("manage/venues/{venueId}/archive");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(ArchiveVenueRequest req, CancellationToken ct)
    {
        var result = await _venueService.ArchiveAsync(req.VenueId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ArchiveVenueRequest
{
    [RouteParam]
    public required int VenueId { get; init; }
}

public sealed class ArchiveVenueValidator : Validator<ArchiveVenueRequest>
{
    public ArchiveVenueValidator()
    {
        RuleFor(request => request.VenueId).GreaterThan(0);
    }
}
