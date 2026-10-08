using Furria.Core.Events;

namespace Furria.Application.Events;

public sealed record PublicEventDetails
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required DateTimeOffset? DoorsOpenAt { get; init; }

    public required PublicEventVenue Venue { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }
}
