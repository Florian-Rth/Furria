using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Groups;

public static class TrainingGenerator
{
    public const int MaxHorizonDays = 400;

    private const int DaysPerWeek = 7;

    [Pure]
    public static IReadOnlyList<TrainingCandidate> Expand(
        IReadOnlyList<GroupTrainingSlot> slots,
        DateOnly from,
        DateOnly to
    ) =>
        [
            .. slots
                .SelectMany(slot => DaysOf(slot.Weekday, from, to), ToCandidate)
                .OrderBy(candidate => candidate.StartsAt)
                .ThenBy(candidate => candidate.GroupTrainingSlotId),
        ];

    [Pure]
    private static IReadOnlyList<DateOnly> DaysOf(DayOfWeek weekday, DateOnly from, DateOnly to)
    {
        var first = from.AddDays(DaysUntil(from.DayOfWeek, weekday));

        if (first > to)
            return [];

        var weeks = ((to.DayNumber - first.DayNumber) / DaysPerWeek) + 1;

        return [.. Enumerable.Range(0, weeks).Select(week => first.AddDays(week * DaysPerWeek))];
    }

    [Pure]
    private static int DaysUntil(DayOfWeek from, DayOfWeek to) =>
        ((int)to - (int)from + DaysPerWeek) % DaysPerWeek;

    [Pure]
    private static TrainingCandidate ToCandidate(GroupTrainingSlot slot, DateOnly day)
    {
        var startsAt = ClubClock.At(day, slot.StartsAt);

        return new TrainingCandidate
        {
            GroupTrainingSlotId = slot.Id,
            StartsAt = startsAt,
            EndsAt = startsAt.AddMinutes(slot.DurationMinutes),
            VenueId = slot.VenueId,
        };
    }
}
