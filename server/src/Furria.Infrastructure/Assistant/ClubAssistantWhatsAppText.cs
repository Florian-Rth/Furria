using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.Assistant;

public static partial class ClubAssistantWhatsAppText
{
    [Pure]
    public static string Of(string markdown) =>
        DoubleUnderscore()
            .Replace(DoubleAsterisk().Replace(Heading().Replace(markdown, "*$1*"), "*$1*"), "_$1_");

    [GeneratedRegex(@"^[ \t]*#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$", RegexOptions.Multiline)]
    private static partial Regex Heading();

    [GeneratedRegex(@"\*\*(.+?)\*\*")]
    private static partial Regex DoubleAsterisk();

    [GeneratedRegex(@"__(.+?)__")]
    private static partial Regex DoubleUnderscore();
}
