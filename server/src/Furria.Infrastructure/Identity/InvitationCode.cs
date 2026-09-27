using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Infrastructure.Identity;

public static class InvitationCode
{
    public const int Length = 8;
    public const int PresentedMaxLength = 32;

    private const string Alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private const int GroupLength = 4;
    private const char GroupSeparator = '-';

    public static string Generate(out string hash)
    {
        var code = RandomNumberGenerator.GetString(Alphabet, Length);
        hash = HashOfCanonical(code);
        return $"{code[..GroupLength]}{GroupSeparator}{code[GroupLength..]}";
    }

    [Pure]
    public static string Canonical(string presentedCode) =>
        string.Concat(
            presentedCode
                .Where(character => !char.IsWhiteSpace(character) && character != GroupSeparator)
                .Select(char.ToUpperInvariant)
        );

    [Pure]
    public static string? HashOf(string presentedCode)
    {
        var canonical = Canonical(presentedCode);

        return IsWellFormed(canonical) ? HashOfCanonical(canonical) : null;
    }

    [Pure]
    private static bool IsWellFormed(string canonical) =>
        canonical.Length == Length && canonical.All(character => Alphabet.Contains(character));

    [Pure]
    private static string HashOfCanonical(string canonical) =>
        Base64Url.EncodeToString(SHA256.HashData(Encoding.ASCII.GetBytes(canonical)));
}
