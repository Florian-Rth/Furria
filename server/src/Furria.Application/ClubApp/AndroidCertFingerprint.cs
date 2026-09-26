using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Application.ClubApp;

public static class AndroidCertFingerprint
{
    private const int ByteLength = 32;
    private const char Separator = ':';

    [Pure]
    public static byte[]? BytesOf(string fingerprint)
    {
        var pairs = fingerprint.Trim().Split(Separator);
        if (pairs.Length != ByteLength || !pairs.All(IsHexPair))
            return null;

        return [.. pairs.Select(ByteOf)];
    }

    [Pure]
    private static bool IsHexPair(string pair) =>
        pair.Length == 2 && pair.All(char.IsAsciiHexDigit);

    [Pure]
    private static byte ByteOf(string pair) =>
        byte.Parse(pair, NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture);
}
