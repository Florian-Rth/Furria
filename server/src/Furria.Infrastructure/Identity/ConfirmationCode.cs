using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Infrastructure.Identity;

public static class ConfirmationCode
{
    public const int Length = 6;

    private const int ExclusiveUpperBound = 1_000_000;
    private const string Format = "D6";

    public static string Generate(out string hash)
    {
        var code = RandomNumberGenerator
            .GetInt32(ExclusiveUpperBound)
            .ToString(Format, CultureInfo.InvariantCulture);
        hash = HashOfCanonical(code);
        return code;
    }

    [Pure]
    public static bool Matches(string presentedCode, string storedHash) =>
        HashOf(presentedCode) is { } presentedHash
        && CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(presentedHash),
            Encoding.ASCII.GetBytes(storedHash)
        );

    [Pure]
    private static string? HashOf(string presentedCode)
    {
        var canonical = string.Concat(
            presentedCode.Where(character => !char.IsWhiteSpace(character))
        );

        return IsWellFormed(canonical) ? HashOfCanonical(canonical) : null;
    }

    [Pure]
    private static bool IsWellFormed(string canonical) =>
        canonical.Length == Length && canonical.All(char.IsAsciiDigit);

    [Pure]
    private static string HashOfCanonical(string canonical) =>
        Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(canonical)));
}
