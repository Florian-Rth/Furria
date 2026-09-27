using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Infrastructure.Identity;

public static class PasskeyName
{
    public const int MaxLength = 64;

    private static readonly string[] MonthAbbreviations =
    [
        "Jan.",
        "Feb.",
        "März",
        "Apr.",
        "Mai",
        "Juni",
        "Juli",
        "Aug.",
        "Sep.",
        "Okt.",
        "Nov.",
        "Dez.",
    ];

    [Pure]
    public static string Chosen(string? name, DateOnly addedOn) =>
        string.IsNullOrWhiteSpace(name) ? DefaultFor(addedOn) : name.Trim();

    [Pure]
    public static string DefaultFor(DateOnly addedOn) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"Passkey vom {addedOn.Day}. {MonthAbbreviations[addedOn.Month - 1]} {addedOn.Year}"
        );
}
