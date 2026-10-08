using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Endpoints.TicketRequests;

namespace Furria.Api.Tests.MembershipApplications;

internal static class AltchaSolver
{
    private static readonly JsonSerializerOptions WidgetJson = new(JsonSerializerDefaults.Web);

    public static AltchaSolution Solve(GetMembershipApplicationChallengeResponse challenge) =>
        SolutionOf(
            challenge.Parameters.Nonce,
            challenge.Parameters.Salt,
            challenge.Parameters.Cost,
            challenge.Parameters.KeyLength,
            challenge.Parameters.KeyPrefix
        );

    public static string PayloadOf(
        GetMembershipApplicationChallengeResponse challenge,
        AltchaSolution solution
    ) => PayloadOf(challenge.Parameters, challenge.Signature, solution);

    public static string SolvedPayloadOf(GetTicketRequestChallengeResponse challenge) =>
        PayloadOf(
            challenge.Parameters,
            challenge.Signature,
            SolutionOf(
                challenge.Parameters.Nonce,
                challenge.Parameters.Salt,
                challenge.Parameters.Cost,
                challenge.Parameters.KeyLength,
                challenge.Parameters.KeyPrefix
            )
        );

    private static AltchaSolution SolutionOf(
        string nonceHex,
        string saltHex,
        int cost,
        int keyLength,
        string keyPrefix
    )
    {
        var nonce = Convert.FromHexString(nonceHex);
        var salt = Convert.FromHexString(saltHex);

        for (uint counter = 0; ; counter++)
        {
            var derivedKey = Convert.ToHexStringLower(
                DerivedKeyOf(nonce, salt, counter, cost, keyLength)
            );
            if (derivedKey.StartsWith(keyPrefix, StringComparison.Ordinal))
                return new AltchaSolution(counter, derivedKey);
        }
    }

    private static string PayloadOf(object parameters, string signature, AltchaSolution solution) =>
        Convert.ToBase64String(
            Encoding.UTF8.GetBytes(
                JsonSerializer.Serialize(
                    new
                    {
                        challenge = new { Parameters = parameters, Signature = signature },
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
