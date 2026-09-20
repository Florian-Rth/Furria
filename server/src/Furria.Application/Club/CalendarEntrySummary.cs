using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntrySummary
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required string? OwnerGroupName { get; init; }

    public required CalendarEntryVisibility Visibility { get; init; }

    public required bool AsksForResponse { get; init; }

    public required string? Description { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsRunning { get; init; }
}
