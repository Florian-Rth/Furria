using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarNotifyReachQuery
{
    public required int ActorAccountId { get; init; }

    public required int? ActorPersonId { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<int> AudienceGroupIds { get; init; }

    public required IReadOnlyList<int> AudiencePersonIds { get; init; }
}
