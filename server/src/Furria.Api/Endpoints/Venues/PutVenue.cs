using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class PutVenue : Endpoint<PutVenueRequest>
{
    private readonly VenueService _venueService;

    public PutVenue(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Put("manage/venues/{venueId}");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutVenueRequest req, CancellationToken ct)
    {
        var result = await _venueService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateVenueCommand ToCommand(PutVenueRequest req) =>
        new()
        {
            VenueId = req.VenueId,
            Name = req.Name,
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
            Hint = req.Hint,
        };
}

public sealed record PutVenueRequest
{
    [RouteParam]
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }
}

public sealed class PutVenueValidator : Validator<PutVenueRequest>
{
    public PutVenueValidator()
    {
        RuleFor(request => request.VenueId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(VenueLimits.NameLength);
        RuleFor(request => request.Street).NotEmpty().MaximumLength(VenueLimits.StreetLength);
        RuleFor(request => request.Zip).NotEmpty().MaximumLength(VenueLimits.ZipLength);
        RuleFor(request => request.City).NotEmpty().MaximumLength(VenueLimits.CityLength);
        RuleFor(request => request.Hint).MaximumLength(VenueLimits.HintLength);
    }
}
