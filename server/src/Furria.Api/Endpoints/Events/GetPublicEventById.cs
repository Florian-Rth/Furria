using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Application.Club;
using Furria.Application.Events;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class GetPublicEventById
    : Endpoint<GetPublicEventByIdRequest, GetPublicEventByIdResponse>
{
    private readonly EventService _eventService;

    public GetPublicEventById(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Get("public/events/{eventId}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicEventByIdRequest req, CancellationToken ct)
    {
        var details = await _eventService.GetPublicEventAsync(req.EventId, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetPublicEventByIdResponse ToResponse(PublicEventDetails details) =>
        new()
        {
            EventId = details.EventId,
            Title = details.Title,
            StartsAt = details.StartsAt,
            EndsAt = details.EndsAt,
            DoorsOpenAt = details.DoorsOpenAt,
            Venue = ToDto(details.Venue),
            Teaser = details.Teaser,
            Description = details.Description,
            AgeHint = details.AgeHint,
            PriceCents = details.PriceCents,
            PresaleStartsAt = details.PresaleStartsAt,
            Status = details.Status,
            Picture = PublicEventPictureDto.From(details.Picture),
            PresalePlaces = [.. details.PresalePlaces.Select(ToDto)],
        };

    private static PublicPresalePlaceDto ToDto(PublicPresalePlace place) =>
        new()
        {
            Name = place.Name,
            Street = place.Street,
            Zip = place.Zip,
            City = place.City,
            Hint = place.Hint,
            OpeningHours = [.. place.OpeningHours.Select(ToDto)],
        };

    private static PublicOpeningSlotDto ToDto(VenueOpeningSlotDetails slot) =>
        new()
        {
            Weekday = slot.Weekday,
            Opens = slot.Opens,
            Closes = slot.Closes,
        };

    private static PublicEventVenueDetailsDto ToDto(PublicEventVenue venue) =>
        new()
        {
            Name = venue.Name,
            Street = venue.Street,
            Zip = venue.Zip,
            City = venue.City,
            Hint = venue.Hint,
        };
}

public sealed record GetPublicEventByIdRequest
{
    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class GetPublicEventByIdValidator : Validator<GetPublicEventByIdRequest>
{
    public GetPublicEventByIdValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}

public sealed record GetPublicEventByIdResponse
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required DateTimeOffset? DoorsOpenAt { get; init; }

    public required PublicEventVenueDetailsDto Venue { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required PublicEventPictureDto? Picture { get; init; }

    public required IReadOnlyList<PublicPresalePlaceDto> PresalePlaces { get; init; }
}

public sealed record PublicPresalePlaceDto
{
    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }

    public required IReadOnlyList<PublicOpeningSlotDto> OpeningHours { get; init; }
}

public sealed record PublicOpeningSlotDto
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly Opens { get; init; }

    public required TimeOnly Closes { get; init; }
}

public sealed record PublicEventVenueDetailsDto
{
    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }
}
