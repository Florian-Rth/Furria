using Furria.Core.Events;

namespace Furria.Application.Club;

public sealed record CalendarEventFacts
{
    public required TimeOnly? DoorsOpenAt { get; init; }

    public required string Teaser { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }
}
