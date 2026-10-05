using Furria.Core.Club;

namespace Furria.Application.Start;

public sealed record StartEntrySummary
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required bool IsRunning { get; init; }

    public required StartVenue? Venue { get; init; }

    public required bool ViewerHoldsVenueKey { get; init; }

    public required StartGroupRef? OwnerGroup { get; init; }

    public required IReadOnlyList<StartGroupRef> ParticipatingGroups { get; init; }

    public required IReadOnlyList<int> ViewerGroupIds { get; init; }

    public required StartRun? ViewerRuns { get; init; }

    public required StartAttendance? Attendance { get; init; }

    public required string? Description { get; init; }
}
