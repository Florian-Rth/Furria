using Furria.Application.Media;
using Furria.Core.Events;

namespace Furria.Application.Events;

public sealed record EventSummary
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? VenueName { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required bool IsOver { get; init; }

    public required PictureDetails? Picture { get; init; }

    public required TimeOnly? DoorsOpenAt { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required EventPlanning Planning { get; init; }
}
