using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record ClubHubCalendarEntry
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required string? VenueName { get; init; }

    public required bool IsRunning { get; init; }
}
