using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Venues;

public sealed class PostVenue : Endpoint<PostVenueRequest, PostVenueResponse>
{
    private readonly VenueService _venueService;

    public PostVenue(VenueService venueService)
    {
        _venueService = venueService;
    }

    public override void Configure()
    {
        Post("manage/venues");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PostVenueRequest req, CancellationToken ct)
    {
        var result = await _venueService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateVenueCommand ToCommand(PostVenueRequest req) =>
        new()
        {
            Name = req.Name,
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
            Hint = req.Hint,
        };

    private static PostVenueResponse ToResponse(int venueId) => new() { VenueId = venueId };
}

public sealed record PostVenueRequest
{
    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }
}

public sealed class PostVenueValidator : Validator<PostVenueRequest>
{
    public PostVenueValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(VenueLimits.NameLength);
        RuleFor(request => request.Street).NotEmpty().MaximumLength(VenueLimits.StreetLength);
        RuleFor(request => request.Zip).NotEmpty().MaximumLength(VenueLimits.ZipLength);
        RuleFor(request => request.City).NotEmpty().MaximumLength(VenueLimits.CityLength);
        RuleFor(request => request.Hint).MaximumLength(VenueLimits.HintLength);
    }
}

public sealed record PostVenueResponse
{
    public required int VenueId { get; init; }
}
