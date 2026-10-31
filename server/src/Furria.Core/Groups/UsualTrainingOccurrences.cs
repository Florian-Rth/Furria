using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Groups;

public static class UsualTrainingOccurrences
{
    private const int DaysPerWeek = 7;

    [Pure]
    public static IReadOnlyList<UsualTrainingOccurrence> Between(
        IReadOnlyList<UsualTrainingTime> usualTimes,
        DateOnly from,
        DateOnly to
    ) =>
        [
            .. usualTimes
                .SelectMany(usualTime => DaysOf(usualTime.Weekday, from, to), ToOccurrence)
                .OrderBy(occurrence => occurrence.StartsAt)
                .ThenBy(occurrence => occurrence.UsualTrainingTimeId),
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
    private static UsualTrainingOccurrence ToOccurrence(UsualTrainingTime usualTime, DateOnly day)
    {
        var startsAt = ClubClock.At(day, usualTime.StartsAt);

        return new UsualTrainingOccurrence
        {
            UsualTrainingTimeId = usualTime.Id,
            GroupId = usualTime.GroupId,
            StartsAt = startsAt,
            EndsAt = startsAt.AddMinutes(usualTime.DurationMinutes),
            VenueId = usualTime.VenueId,
        };
    }
}
