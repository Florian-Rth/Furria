using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Furria.Api.Endpoints.MembershipApplications;

namespace Furria.Api.Tests.MembershipApplications;

internal static class AltchaSolver
{
    private static readonly JsonSerializerOptions WidgetJson = new(JsonSerializerDefaults.Web);

    public static AltchaSolution Solve(GetMembershipApplicationChallengeResponse challenge)
    {
        var parameters = challenge.Parameters;
        var nonce = Convert.FromHexString(parameters.Nonce);
        var salt = Convert.FromHexString(parameters.Salt);

        for (uint counter = 0; ; counter++)
        {
            var derivedKey = Convert.ToHexStringLower(
                DerivedKeyOf(nonce, salt, counter, parameters.Cost, parameters.KeyLength)
            );
            if (derivedKey.StartsWith(parameters.KeyPrefix, StringComparison.Ordinal))
                return new AltchaSolution(counter, derivedKey);
        }
    }

    public static string PayloadOf(
        GetMembershipApplicationChallengeResponse challenge,
        AltchaSolution solution
    ) =>
        Convert.ToBase64String(
            Encoding.UTF8.GetBytes(
                JsonSerializer.Serialize(
                    new
                    {
                        challenge = new { challenge.Parameters, challenge.Signature },
                        solution = new
                        {
                            solution.Counter,
                            solution.DerivedKey,
                            Time = 12.3,
                        },
                    },
                    WidgetJson
                )
            )
        );

    private static byte[] DerivedKeyOf(
        byte[] nonce,
        byte[] salt,
        uint counter,
        int cost,
        int keyLength
    )
    {
        var password = new byte[nonce.Length + sizeof(uint)];
        nonce.CopyTo(password, 0);
        BinaryPrimitives.WriteUInt32BigEndian(password.AsSpan(nonce.Length), counter);

        return Rfc2898DeriveBytes.Pbkdf2(password, salt, cost, HashAlgorithmName.SHA256, keyLength);
    }
}

internal sealed record AltchaSolution(uint Counter, string DerivedKey);
