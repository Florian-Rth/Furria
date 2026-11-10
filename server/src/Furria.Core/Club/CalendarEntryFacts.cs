using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed record CalendarEntryFacts
{
    public required int? OwnerGroupId { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<int> AudienceGroupIds { get; init; }

    public required IReadOnlyList<int> AudiencePersonIds { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required bool AsksForResponse { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public int SessionYear => ClubSession.YearOf(ClubClock.DayOf(StartsAt));

    public bool IsForChosenPeople => Audience == CalendarEntryAudience.People;

    [Pure]
    public IEnumerable<int> CastGroupIds() =>
        IsForChosenPeople ? []
        : OwnerGroupId is { } owner ? [owner, .. AudienceGroupIds]
        : AudienceGroupIds;

    [Pure]
    public IEnumerable<int> TieGroupIds() =>
        OwnerGroupId is { } owner
            ? [owner, .. ParticipatingGroupIds, .. AudienceGroupIds]
            : [.. ParticipatingGroupIds, .. AudienceGroupIds];

    [Pure]
    public bool AsksTheCastOf(IReadOnlySet<GroupSession> actSessions) =>
        CastAttendance.AsksTheCast(
            Kind,
            AsksForResponse,
            CastGroupIds(),
            CastAttendance.SessionYearOf(StartsAt),
            actSessions
        );
}
