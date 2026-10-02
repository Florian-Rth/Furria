using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class Anniversary
{
    private const int RoundStep = 5;
    private const int ElevenStep = 11;
    private const int JubileeStep = 5;

    [Pure]
    public static DateOnly DayIn(DateOnly origin, int year) =>
        new(year, origin.Month, Math.Min(origin.Day, DateTime.DaysInMonth(year, origin.Month)));

    [Pure]
    public static int YearsOn(DateOnly origin, DateOnly day) =>
        day < DayIn(origin, day.Year) ? day.Year - origin.Year - 1 : day.Year - origin.Year;

    [Pure]
    public static bool IsRound(int years) =>
        years > 0 && (years % RoundStep == 0 || years % ElevenStep == 0);

    [Pure]
    public static int? GroupJubileeYears(int? foundedYear, int sessionYear) =>
        foundedYear is { } founded && IsJubilee(sessionYear - founded)
            ? sessionYear - founded
            : null;

    [Pure]
    private static bool IsJubilee(int years) => years > 0 && years % JubileeStep == 0;
}
