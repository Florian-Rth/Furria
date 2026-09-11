using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubClock
{
    private static readonly TimeZoneInfo ClubTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
        "Europe/Berlin"
    );

    [Pure]
    public static DateOnly Today(TimeProvider timeProvider) =>
        DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTime(timeProvider.GetUtcNow(), ClubTimeZone).DateTime
        );
}
