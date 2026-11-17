using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

public sealed record CalendarPushReach
{
    public required CalendarPushReason Reason { get; init; }

    public required CalendarEntryFacts Entry { get; init; }

    public required int? ActorPersonId { get; init; }

    public required IReadOnlyList<int> AddressedPersonIds { get; init; }

    public required IReadOnlySet<int> SkippedPersonIds { get; init; }

    public required DateOnly Today { get; init; }
}
