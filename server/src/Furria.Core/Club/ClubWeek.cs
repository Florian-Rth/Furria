using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubWeek
{
    private const int DaysPerWeek = 7;

    [Pure]
    public static int PositionOf(DayOfWeek weekday) =>
        ((int)weekday - (int)DayOfWeek.Monday + DaysPerWeek) % DaysPerWeek;
}
