using Furria.Application.Club;
using Furria.Core.Groups;

namespace Furria.Application.Groups;

public sealed record TrainingPreviewRow
{
    public required int GroupTrainingSlotId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required TrainingPreviewState State { get; init; }

    public required IReadOnlyList<CalendarEntrySummary> VenueCollisions { get; init; }
}
