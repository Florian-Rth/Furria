using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Gallery;

public static class AlbumSession
{
    [Pure]
    public static int? YearOf(DateTimeOffset? entryStartsAt, int? sessionStartYear) =>
        entryStartsAt is { } startsAt
            ? ClubSession.YearOf(ClubClock.DayOf(startsAt))
            : sessionStartYear;
}
