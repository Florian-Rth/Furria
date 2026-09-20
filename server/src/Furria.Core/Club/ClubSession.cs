using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubSession
{
    private const int AshWednesdayOffset = 46;

    public const int EarliestSessionYear = 1971;
    public const int OpeningMonth = 11;
    public const int OpeningDay = 11;

    [Pure]
    public static int YearOf(DateOnly date) =>
        date.Month > OpeningMonth || (date.Month == OpeningMonth && date.Day >= OpeningDay)
            ? date.Year
            : date.Year - 1;

    [Pure]
    public static string LabelOf(int sessionYear) => $"{sessionYear}/{(sessionYear + 1) % 100:D2}";

    [Pure]
    public static DateOnly OpeningOf(int sessionYear) => new(sessionYear, OpeningMonth, OpeningDay);

    [Pure]
    public static DateOnly AshWednesdayOf(int year) =>
        EasterSundayOf(year).AddDays(-AshWednesdayOffset);

    [Pure]
    public static DateOnly ClosingOf(int sessionYear) => AshWednesdayOf(sessionYear + 1).AddDays(1);

    [Pure]
    public static bool IsBetweenSessions(DateOnly date) => date >= ClosingOf(YearOf(date));

    [Pure]
    public static int RelevantYearOf(DateOnly date) =>
        IsBetweenSessions(date) ? YearOf(date) + 1 : YearOf(date);

    [Pure]
    private static DateOnly EasterSundayOf(int year)
    {
        var metonic = year % 19;
        var century = year / 100;
        var yearInCentury = year % 100;
        var leapCenturies = century / 4;
        var centuryRest = century % 4;
        var lunarShift = (century + 8) / 25;
        var lunarCorrection = (century - lunarShift + 1) / 3;
        var epact = (19 * metonic + century - leapCenturies - lunarCorrection + 15) % 30;
        var leapYears = yearInCentury / 4;
        var yearRest = yearInCentury % 4;
        var weekday = (32 + 2 * centuryRest + 2 * leapYears - epact - yearRest) % 7;
        var correction = (metonic + 11 * epact + 22 * weekday) / 451;
        var dayOfMarch = epact + weekday - 7 * correction + 114;

        return new DateOnly(year, dayOfMarch / 31, (dayOfMarch % 31) + 1);
    }
}
