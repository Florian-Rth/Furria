using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;

namespace Furria.Core.Text;

public static class GermanFold
{
    private const string Eszett = "ß";
    private const string DoubleS = "ss";

    [Pure]
    public static string Expand(string value) =>
        Lowered(value)
            .Replace("ä", "ae", StringComparison.Ordinal)
            .Replace("ö", "oe", StringComparison.Ordinal)
            .Replace("ü", "ue", StringComparison.Ordinal);

    [Pure]
    public static string Strip(string value)
    {
        var decomposed = Lowered(value).Normalize(NormalizationForm.FormD);
        var stripped = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                stripped.Append(character);
        }

        return stripped.ToString().Normalize(NormalizationForm.FormC);
    }

    [Pure]
    private static string Lowered(string value) =>
        value.ToLowerInvariant().Replace(Eszett, DoubleS, StringComparison.Ordinal);
}
