using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record UpdateCalendarEntryCommand
{
    public required int ActorAccountId { get; init; }

    public required int? ViewerPersonId { get; init; }

    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required int? VenueId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<int> AudienceGroupIds { get; init; }

    public required IReadOnlyList<int> AudiencePersonIds { get; init; }

    public required IReadOnlyList<CalendarEntryAddOnInput> AddOns { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }
}
