using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class AnnouncementPushRules
{
    private static readonly TimeSpan ShortestTimeToLive = TimeSpan.FromHours(1);
    private static readonly TimeSpan LongestTimeToLive = TimeSpan.FromDays(28);

    [Pure]
    public static bool IsStillValid(DateOnly? validUntil, DateTimeOffset now) =>
        validUntil is not { } lastDay || lastDay >= ClubClock.DayOf(now);

    [Pure]
    public static TimeSpan TimeToLive(DateOnly? validUntil, DateTimeOffset now) =>
        validUntil is { } lastDay
            ? TimeSpan.FromTicks(
                Math.Clamp(
                    (ClubClock.StartOfDay(lastDay.AddDays(1)) - now).Ticks,
                    ShortestTimeToLive.Ticks,
                    LongestTimeToLive.Ticks
                )
            )
            : LongestTimeToLive;
}
