using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Furria.Infrastructure.Push;

public static class VapidToken
{
    public static readonly TimeSpan Lifetime = TimeSpan.FromHours(12);

    private static readonly string EncodedHeader = Base64Url.EncodeToString(
        """{"typ":"JWT","alg":"ES256"}"""u8
    );

    [Pure]
    public static string AudienceOf(Uri endpoint) => endpoint.GetLeftPart(UriPartial.Authority);

    public static string For(string audience, string subject, DateTimeOffset now, ECDsa signer)
    {
        var claims = JsonSerializer.SerializeToUtf8Bytes(
            new Dictionary<string, object>
            {
                ["aud"] = audience,
                ["exp"] = (now + Lifetime).ToUnixTimeSeconds(),
                ["sub"] = subject,
            }
        );
        var unsigned = $"{EncodedHeader}.{Base64Url.EncodeToString(claims)}";
        var signature = signer.SignData(
            Encoding.ASCII.GetBytes(unsigned),
            HashAlgorithmName.SHA256
        );

        return $"{unsigned}.{Base64Url.EncodeToString(signature)}";
    }
}
