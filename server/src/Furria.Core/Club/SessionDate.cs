using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public readonly record struct SessionDate
{
    private SessionDate(int? sessionStartYear)
    {
        SessionStartYear = sessionStartYear;
    }

    internal int? SessionStartYear { get; }

    [Pure]
    public static SessionDate At(DateTimeOffset? instant) =>
        new(instant is { } at ? ClubSession.YearOf(ClubClock.DayOf(at)) : null);

    [Pure]
    public static SessionDate In(int? sessionStartYear) => new(sessionStartYear);
}
