using System.Buffers;
using System.Buffers.Binary;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Furria.Api.Altcha;

public sealed class AltchaChallenges
{
    private const string Algorithm = "PBKDF2/SHA-256";
    private const int KeyLength = 32;
    private const int KeyPrefixLength = KeyLength / 2;
    private const int RandomLength = 16;
    private const int CounterLength = sizeof(uint);
    private const string KeySignatureSecretLabel = "derived-secret";

    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    private static readonly JsonSerializerOptions PayloadJson = new(JsonSerializerDefaults.Web)
    {
        RespectNullableAnnotations = true,
    };

    private readonly AltchaOptions _options;
    private readonly byte[] _signatureSecret;
    private readonly byte[] _keySignatureSecret;
    private readonly SpentAltchaChallenges _spentChallenges;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<AltchaChallenges> _logger;

    public AltchaChallenges(
        IOptions<AltchaOptions> options,
        SpentAltchaChallenges spentChallenges,
        TimeProvider timeProvider,
        ILogger<AltchaChallenges> logger
    )
    {
        _options = options.Value;
        _signatureSecret = Encoding.UTF8.GetBytes(_options.HmacKey);
        _keySignatureSecret = KeySignatureSecretOf(_options.HmacKey);
        _spentChallenges = spentChallenges;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public AltchaChallenge Issue()
    {
        var nonce = RandomNumberGenerator.GetBytes(RandomLength);
        var salt = RandomNumberGenerator.GetBytes(RandomLength);
        var counter = RandomNumberGenerator.GetInt32(_options.MinCounter, _options.MaxCounter + 1);
        var derivedKey = DerivedKeyOf(nonce, salt, (uint)counter, _options.Cost);

        var parameters = new AltchaChallengeParameters
        {
            Algorithm = Algorithm,
            Cost = _options.Cost,
            ExpiresAt = (_timeProvider.GetUtcNow() + Lifetime).ToUnixTimeSeconds(),
            KeyLength = KeyLength,
            KeyPrefix = Convert.ToHexStringLower(derivedKey.AsSpan(0, KeyPrefixLength)),
            KeySignature = Convert.ToHexStringLower(
                HMACSHA256.HashData(_keySignatureSecret, derivedKey)
            ),
            Nonce = Convert.ToHexStringLower(nonce),
            Salt = Convert.ToHexStringLower(salt),
        };

        return new AltchaChallenge { Parameters = parameters, Signature = SignatureOf(parameters) };
    }

    public AltchaRejection? Redeem(string encodedPayload)
    {
        var rejection = RejectionOf(PayloadOf(encodedPayload));
        if (rejection is not null)
            _logger.LogInformation("Altcha payload refused as {AltchaRejection}", rejection);

        return rejection;
    }

    private AltchaRejection? RejectionOf(AltchaPayload? payload)
    {
        if (payload is null)
            return AltchaRejection.Malformed;

        var parameters = payload.Challenge.Parameters;
        if (!HexEquals(payload.Challenge.Signature, SignatureBytesOf(parameters)))
            return AltchaRejection.Forged;

        var expiresAt = DateTimeOffset.FromUnixTimeSeconds(parameters.ExpiresAt);
        if (expiresAt <= _timeProvider.GetUtcNow())
            return AltchaRejection.Expired;

        if (!IsSolvedBy(parameters, payload.Solution.DerivedKey))
            return AltchaRejection.Unsolved;

        return _spentChallenges.TrySpend(parameters.Nonce, expiresAt)
            ? null
            : AltchaRejection.Replayed;
    }

    private bool IsSolvedBy(AltchaChallengeParameters parameters, string presentedDerivedKey)
    {
        var derivedKey = new byte[KeyLength];
        var decoded =
            presentedDerivedKey.Length == KeyLength * 2
            && Convert.FromHexString(presentedDerivedKey, derivedKey, out _, out _)
                == OperationStatus.Done;

        return decoded
            && HexEquals(
                parameters.KeySignature,
                HMACSHA256.HashData(_keySignatureSecret, derivedKey)
            );
    }

    private string SignatureOf(AltchaChallengeParameters parameters) =>
        Convert.ToHexStringLower(SignatureBytesOf(parameters));

    private byte[] SignatureBytesOf(AltchaChallengeParameters parameters) =>
        HMACSHA256.HashData(_signatureSecret, CanonicalJsonOf(parameters));

    [Pure]
    private static AltchaPayload? PayloadOf(string encodedPayload)
    {
        var decoded = new byte[encodedPayload.Length];
        if (!Convert.TryFromBase64String(encodedPayload, decoded, out var length))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AltchaPayload>(
                decoded.AsSpan(0, length),
                PayloadJson
            );
        }
        catch (JsonException)
        {
            return null;
        }
    }

    [Pure]
    private static bool HexEquals(string presentedHex, byte[] expected) =>
        CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(presentedHex),
            Encoding.ASCII.GetBytes(Convert.ToHexStringLower(expected))
        );

    [Pure]
    private static byte[] DerivedKeyOf(byte[] nonce, byte[] salt, uint counter, int cost)
    {
        var password = new byte[nonce.Length + CounterLength];
        nonce.CopyTo(password, 0);
        BinaryPrimitives.WriteUInt32BigEndian(password.AsSpan(nonce.Length), counter);

        return Rfc2898DeriveBytes.Pbkdf2(password, salt, cost, HashAlgorithmName.SHA256, KeyLength);
    }

    [Pure]
    private static byte[] KeySignatureSecretOf(string hmacKey) =>
        Encoding.UTF8.GetBytes(
            Convert.ToHexStringLower(
                HMACSHA256.HashData(
                    Encoding.UTF8.GetBytes(KeySignatureSecretLabel),
                    Encoding.UTF8.GetBytes(hmacKey)
                )
            )
        );

    [Pure]
    private static byte[] CanonicalJsonOf(AltchaChallengeParameters parameters)
    {
        using var buffer = new MemoryStream();
        using (var json = new Utf8JsonWriter(buffer))
        {
            json.WriteStartObject();
            json.WriteString("algorithm", parameters.Algorithm);
            json.WriteNumber("cost", parameters.Cost);
            json.WriteNumber("expiresAt", parameters.ExpiresAt);
            json.WriteNumber("keyLength", parameters.KeyLength);
            json.WriteString("keyPrefix", parameters.KeyPrefix);
            json.WriteString("keySignature", parameters.KeySignature);
            json.WriteString("nonce", parameters.Nonce);
            json.WriteString("salt", parameters.Salt);
            json.WriteEndObject();
        }

        return buffer.ToArray();
    }
}
