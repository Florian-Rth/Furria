using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed record CalendarEntryFacts
{
    public required int? OwnerGroupId { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }

    public required CalendarEntryVisibility Visibility { get; init; }

    public required int SessionYear { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required bool AsksForResponse { get; init; }

    public required int CastSessionYear { get; init; }

    [Pure]
    public static CalendarEntryFacts Of(
        int? ownerGroupId,
        IReadOnlyList<int> participatingGroupIds,
        CalendarEntryVisibility visibility,
        CalendarEntryKind kind,
        bool asksForResponse,
        DateTimeOffset startsAt
    ) =>
        new()
        {
            OwnerGroupId = ownerGroupId,
            ParticipatingGroupIds = participatingGroupIds,
            Visibility = visibility,
            SessionYear = ClubSession.YearOf(ClubClock.DayOf(startsAt)),
            Kind = kind,
            AsksForResponse = asksForResponse,
            CastSessionYear = CastAttendance.SessionYearOf(startsAt),
        };

    [Pure]
    public IEnumerable<int> GroupIds() =>
        OwnerGroupId is { } owner ? [owner, .. ParticipatingGroupIds] : ParticipatingGroupIds;

    [Pure]
    public bool AsksTheCastOf(IReadOnlySet<GroupSession> actSessions) =>
        CastAttendance.AsksTheCast(Kind, AsksForResponse, GroupIds(), CastSessionYear, actSessions);
}
