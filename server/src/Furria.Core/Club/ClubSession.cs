using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubSession
{
    public const int FoundingYear = 1971;
    public const int OpeningMonth = 11;
    public const int OpeningDay = 11;

    [Pure]
    public static int YearOf(DateOnly date) =>
        date.Month > OpeningMonth || (date.Month == OpeningMonth && date.Day >= OpeningDay)
            ? date.Year
            : date.Year - 1;

    [Pure]
    public static int NumberOf(int sessionYear) => sessionYear - FoundingYear + 1;

    [Pure]
    public static string LabelOf(int sessionYear) => $"{sessionYear}/{(sessionYear + 1) % 100:D2}";
}
