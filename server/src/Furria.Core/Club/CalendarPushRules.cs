using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class CalendarPushRules
{
    private static readonly TimeSpan ShortestTimeToLive = TimeSpan.FromHours(1);
    private static readonly TimeSpan LongestTimeToLive = TimeSpan.FromDays(28);

    [Pure]
    public static IReadOnlyList<int> NewlyChosen(
        CalendarEntryAudience audienceBefore,
        IReadOnlyCollection<int> chosenBefore,
        CalendarEntryAudience audienceAfter,
        IReadOnlyCollection<int> chosenAfter
    ) =>
        audienceAfter != CalendarEntryAudience.People ? []
        : audienceBefore != CalendarEntryAudience.People ? [.. chosenAfter.Distinct()]
        : [.. chosenAfter.Except(chosenBefore)];

    [Pure]
    public static bool Moves(CalendarEntrySlot before, CalendarEntrySlot after) => before != after;

    [Pure]
    public static bool IsDue(
        CalendarPushReason reason,
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt,
        DateTimeOffset now
    ) =>
        reason == CalendarPushReason.AsksForResponse
            ? startsAt > now
            : EndOf(startsAt, endsAt) > now;

    [Pure]
    public static bool MayConcern(
        CalendarPushReason reason,
        CalendarEntryFacts entry,
        CalendarTies ties
    ) => reason != CalendarPushReason.AsksForResponse || ties.Concerns(entry);

    [Pure]
    public static bool Reaches(
        CalendarPushReason reason,
        CalendarEntryFacts entry,
        CalendarTies ties,
        CalendarRights rights
    ) => MayConcern(reason, entry, ties) && ties.Sees(entry, rights);

    [Pure]
    public static TimeSpan TimeToLive(DateTimeOffset startsAt, DateTimeOffset now) =>
        TimeSpan.FromTicks(
            Math.Clamp((startsAt - now).Ticks, ShortestTimeToLive.Ticks, LongestTimeToLive.Ticks)
        );

    [Pure]
    private static DateTimeOffset EndOf(DateTimeOffset startsAt, DateTimeOffset? endsAt) =>
        endsAt ?? startsAt.AddHours(CalendarDefaults.OpenEndedHours);
}
