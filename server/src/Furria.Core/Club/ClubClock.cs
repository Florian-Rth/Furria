using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubClock
{
    private static readonly TimeZoneInfo ClubTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
        "Europe/Berlin"
    );

    [Pure]
    public static DateOnly Today(TimeProvider timeProvider) => DayOf(timeProvider.GetUtcNow());

    [Pure]
    public static DateOnly DayOf(DateTimeOffset instant) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(instant, ClubTimeZone).DateTime);

    [Pure]
    public static DateTimeOffset At(DateOnly day, TimeOnly time)
    {
        var wallClock = day.ToDateTime(time, DateTimeKind.Unspecified);

        return new DateTimeOffset(
            wallClock,
            ClubTimeZone.GetUtcOffset(wallClock)
        ).ToUniversalTime();
    }

    [Pure]
    public static DateTimeOffset StartOfDay(DateOnly day) =>
        new(
            TimeZoneInfo.ConvertTimeToUtc(
                day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified),
                ClubTimeZone
            )
        );
}
