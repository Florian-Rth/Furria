using System.Diagnostics.Contracts;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Gallery;

public static class UploadLinkTokens
{
    private const string Purpose = "upload-link/";

    public static string NewSeed() => SeededLinkToken.NewSeed();

    [Pure]
    public static string TokenOf(byte[] key, string seed) =>
        SeededLinkToken.TokenOf(key, Purpose, seed);

    [Pure]
    public static string HashOf(byte[] key, string seed) =>
        SeededLinkToken.HashOf(key, Purpose, seed);

    [Pure]
    public static string? HashOfPresented(string presentedToken) =>
        SeededLinkToken.HashOfPresented(presentedToken);
}
