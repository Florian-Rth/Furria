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
            : AddOnClosing.EntryEndOf(startsAt, endsAt) > now;

    [Pure]
    public static bool IsReminderDue(DateTimeOffset closesAt, DateTimeOffset now) => closesAt > now;

    [Pure]
    public static bool ReachesEveryoneConcerned(CalendarPushReason reason) =>
        reason is CalendarPushReason.AsksForResponse or CalendarPushReason.Reminder;

    [Pure]
    public static bool MayConcern(
        CalendarPushReason reason,
        CalendarEntryFacts entry,
        CalendarTies ties
    ) => !ReachesEveryoneConcerned(reason) || ties.Concerns(entry);

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
}
