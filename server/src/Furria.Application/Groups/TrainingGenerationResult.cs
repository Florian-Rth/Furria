using Furria.Application.Club;

namespace Furria.Application.Groups;

public sealed record TrainingGenerationResult
{
    public required int CreatedCount { get; init; }

    public required int SkippedCount { get; init; }

    public required IReadOnlyList<CalendarEntrySummary> VenueCollisions { get; init; }
}
