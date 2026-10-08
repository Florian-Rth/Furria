namespace Furria.Application.Events;

public sealed record EventFactsCommand
{
    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required TimeOnly? DoorsOpenAt { get; init; }

    public required int VenueId { get; init; }

    public required string Teaser { get; init; }

    public required string? Description { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }
}
