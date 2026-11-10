using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

public sealed class OutboxCalendarPush
{
    public long Id { get; set; }

    public CalendarPushReason Reason { get; set; }

    public int CalendarEntryId { get; set; }

    public int? ActorPersonId { get; set; }

    public List<int> PersonIds { get; set; } = [];

    public string Title { get; set; } = "";

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset? EndsAt { get; set; }

    public string? VenueName { get; set; }

    public CalendarEntryKind Kind { get; set; }

    public bool AsksForResponse { get; set; }

    public int? OwnerGroupId { get; set; }

    public List<int> ParticipatingGroupIds { get; set; } = [];

    public CalendarEntryAudience Audience { get; set; }

    public List<int> AudienceGroupIds { get; set; } = [];

    public List<int> AudiencePersonIds { get; set; } = [];

    public int Attempt { get; set; } = 1;

    public DateTimeOffset? NextAttemptAt { get; set; }
}
