using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;

namespace Furria.Infrastructure.Mail;

public static class MailDay
{
    private static readonly string[] MonthNames =
    [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ];

    [Pure]
    public static string Of(DateTimeOffset instant)
    {
        var day = ClubClock.DayOf(instant);

        return $"{day.Day.ToString(CultureInfo.InvariantCulture)}. {MonthNames[day.Month - 1]}";
    }
}
