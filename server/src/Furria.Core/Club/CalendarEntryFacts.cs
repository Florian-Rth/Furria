using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed record CalendarEntryFacts
{
    public required int? OwnerGroupId { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }

    public required CalendarEntryVisibility Visibility { get; init; }

    public required int SessionYear { get; init; }

    [Pure]
    public static CalendarEntryFacts Of(
        int? ownerGroupId,
        IReadOnlyList<int> participatingGroupIds,
        CalendarEntryVisibility visibility,
        DateTimeOffset startsAt
    ) =>
        new()
        {
            OwnerGroupId = ownerGroupId,
            ParticipatingGroupIds = participatingGroupIds,
            Visibility = visibility,
            SessionYear = ClubSession.YearOf(ClubClock.DayOf(startsAt)),
        };
}
