using FastEndpoints;
using Furria.Application.Events;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class GetPublicEvents : EndpointWithoutRequest<GetPublicEventsResponse>
{
    private readonly EventService _eventService;

    public GetPublicEvents(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Get("public/events");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var events = await _eventService.GetPublicEventsAsync(ct);

        await Send.OkAsync(ToResponse(events), cancellation: ct);
    }

    private static GetPublicEventsResponse ToResponse(IReadOnlyList<PublicEventSummary> events) =>
        new() { Events = [.. events.Select(ToDto)] };

    private static PublicEventSummaryDto ToDto(PublicEventSummary listed) =>
        new()
        {
            EventId = listed.EventId,
            Title = listed.Title,
            StartsAt = listed.StartsAt,
            EndsAt = listed.EndsAt,
            DoorsOpenAt = listed.DoorsOpenAt,
            Venue = ToDto(listed.Venue),
            Teaser = listed.Teaser,
            AgeHint = listed.AgeHint,
            PriceCents = listed.PriceCents,
            PresaleStartsAt = listed.PresaleStartsAt,
            Status = listed.Status,
        };

    private static PublicEventSummaryVenueDto ToDto(PublicEventVenue venue) =>
        new()
        {
            Name = venue.Name,
            Street = venue.Street,
            Zip = venue.Zip,
            City = venue.City,
            Hint = venue.Hint,
        };
}

public sealed record GetPublicEventsResponse
{
    public required IReadOnlyList<PublicEventSummaryDto> Events { get; init; }
}

public sealed record PublicEventSummaryDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required DateTimeOffset? DoorsOpenAt { get; init; }

    public required PublicEventSummaryVenueDto Venue { get; init; }

    public required string Teaser { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }
}

public sealed record PublicEventSummaryVenueDto
{
    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }
}
