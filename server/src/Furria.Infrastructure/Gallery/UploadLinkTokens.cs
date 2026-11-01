using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Gallery;

public static class UploadLinkTokens
{
    private const int SeedBytes = 16;
    private const string Purpose = "upload-link/";

    public static string NewSeed() =>
        Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(SeedBytes));

    [Pure]
    public static string TokenOf(byte[] key, string seed) =>
        Base64Url.EncodeToString(HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(Purpose + seed)));

    [Pure]
    public static string HashOf(byte[] key, string seed) =>
        OpaqueTokenSecret.HashOf(TokenOf(key, seed))!;

    [Pure]
    public static string? HashOfPresented(string presentedToken) =>
        OpaqueTokenSecret.HashOf(presentedToken);
}
