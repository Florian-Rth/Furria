using System.Diagnostics.Contracts;
using Furria.Core.Text;

namespace Furria.Core.Identity;

public static class ClaimName
{
    private const char Hyphen = '-';
    private const char Space = ' ';

    [Pure]
    public static string Normalize(string name) =>
        string.Join(
            Space,
            GermanFold
                .Strip(GermanFold.Expand(name))
                .Replace(Hyphen, Space)
                .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)
        );
}
