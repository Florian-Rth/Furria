using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Studio;

public static class ChoreographyRetention
{
    private const int DaysKeptWhole = 14;

    [Pure]
    public static DateTimeOffset ThinningCutoff(DateTimeOffset now) =>
        ClubClock.StartOfDay(ClubClock.DayOf(now).AddDays(-DaysKeptWhole));

    [Pure]
    public static IReadOnlyList<int> ThinnedOf(
        IEnumerable<ChoreographyVersionStamp> versions,
        DateTimeOffset now
    )
    {
        var cutoff = ThinningCutoff(now);

        return
        [
            .. versions
                .Where(version => version.SavedAt < cutoff)
                .GroupBy(version => ClubClock.DayOf(version.SavedAt))
                .SelectMany(day => day.OrderByDescending(version => version.Version).Skip(1))
                .Where(version => version.Kind != ChoreographyVersionKind.MusicAdopted)
                .Select(version => version.Version)
                .Order(),
        ];
    }
}
