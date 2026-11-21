using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Infrastructure.Identity;

public static class SeededLinkToken
{
    private const int SeedBytes = 16;

    public static string NewSeed() =>
        Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(SeedBytes));

    [Pure]
    public static string TokenOf(byte[] key, string purpose, string seed) =>
        Base64Url.EncodeToString(HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(purpose + seed)));

    [Pure]
    public static string HashOf(byte[] key, string purpose, string seed) =>
        OpaqueTokenSecret.HashOf(TokenOf(key, purpose, seed))!;

    [Pure]
    public static string? HashOfPresented(string presentedToken) =>
        OpaqueTokenSecret.HashOf(presentedToken);
}
