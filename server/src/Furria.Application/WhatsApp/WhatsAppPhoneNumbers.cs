using System.Diagnostics.Contracts;

namespace Furria.Application.WhatsApp;

public static class WhatsAppPhoneNumbers
{
    public const string InvalidMessage = "Bitte gib eine gültige Telefonnummer an.";

    private const string GermanCountryCode = "49";
    private const string TrunkZero = "(0)";
    private const string InternationalPrefix = "00";
    private const int ShortestDigits = 8;
    private const int LongestDigits = 15;

    private static readonly char[] Separators = [' ', '-', '/', '(', ')', '.'];

    [Pure]
    public static string? InternationalDigitsOf(string phoneNumber)
    {
        var compact = string.Concat(
            phoneNumber.Replace(TrunkZero, "", StringComparison.Ordinal).Trim().Split(Separators)
        );
        var digits = compact switch
        {
            ['+', .. var rest] => rest,
            _ when compact.StartsWith(InternationalPrefix, StringComparison.Ordinal) => compact[
                InternationalPrefix.Length..
            ],
            ['0', .. var national] => GermanCountryCode + national,
            _ => compact,
        };

        return IsInternational(digits) ? digits : null;
    }

    [Pure]
    public static string PhoneOfAccountId(string accountId) =>
        "+" + accountId.Split('@')[0].Split(':')[0];

    [Pure]
    private static bool IsInternational(string digits) =>
        digits.Length is >= ShortestDigits and <= LongestDigits
        && digits[0] != '0'
        && digits.All(char.IsAsciiDigit);
}
