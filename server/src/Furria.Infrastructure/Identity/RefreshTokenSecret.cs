using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;

namespace Furria.Infrastructure.Identity;

public static class RefreshTokenSecret
{
    private const int ByteLength = 32;

    public static string Generate(out string hash)
    {
        var secret = RandomNumberGenerator.GetBytes(ByteLength);
        hash = Base64Url.EncodeToString(SHA256.HashData(secret));
        return Base64Url.EncodeToString(secret);
    }

    [Pure]
    public static string? HashOf(string presentedToken)
    {
        if (
            !Base64Url.IsValid(presentedToken, out var decodedLength)
            || decodedLength != ByteLength
        )
            return null;

        var decoded = new byte[ByteLength];
        if (!Base64Url.TryDecodeFromChars(presentedToken, decoded, out var written))
            return null;

        return written == ByteLength ? Base64Url.EncodeToString(SHA256.HashData(decoded)) : null;
    }
}
