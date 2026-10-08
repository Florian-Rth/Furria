using Furria.Core.Events;

namespace Furria.Application.Events;

public sealed record EventDetails
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required TimeOnly? DoorsOpenAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required TicketAvailability TicketAvailability { get; init; }

    public required DateTimeOffset? CancelledAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required bool IsOver { get; init; }
}
