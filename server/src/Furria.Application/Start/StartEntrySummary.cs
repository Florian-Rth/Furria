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

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<StartGroupRef> AudienceGroups { get; init; }

    public required IReadOnlyList<int> ViewerGroupIds { get; init; }

    public required StartRun? ViewerRuns { get; init; }

    public required StartAttendance? Attendance { get; init; }

    public required IReadOnlyList<StartPoll> OpenPolls { get; init; }

    public required IReadOnlyList<StartSignUpList> OpenSignUpLists { get; init; }

    public required string? Description { get; init; }

    public required StartEvent? Event { get; init; }
}
