using System.Diagnostics.Contracts;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Intakes;

public static class IntakeTokens
{
    private const string Purpose = "intake/";

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
