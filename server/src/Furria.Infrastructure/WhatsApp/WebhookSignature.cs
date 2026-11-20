using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Infrastructure.WhatsApp;

public static class WebhookSignature
{
    [Pure]
    public static bool Verifies(string key, byte[] body, string signature) =>
        TryHexBytes(signature) is { } claimed
        && CryptographicOperations.FixedTimeEquals(
            HMACSHA512.HashData(Encoding.UTF8.GetBytes(key), body),
            claimed
        );

    [Pure]
    private static byte[]? TryHexBytes(string hex)
    {
        try
        {
            return Convert.FromHexString(hex);
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
