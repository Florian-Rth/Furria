using System.Buffers.Binary;
using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Furria.Application.Push;

namespace Furria.Tests.Common.Push;

public sealed record ReceivedPush
{
    private const int SaltLength = 16;
    private const int HeaderFixedLength = SaltLength + sizeof(int) + 1;
    private const int TagLength = 16;
    private const string VapidScheme = "vapid";

    private static readonly byte[] KeyInfoLabel = Encoding.ASCII.GetBytes("WebPush: info\0");

    public required string Endpoint { get; init; }

    public required string Authorization { get; init; }

    public required string TimeToLive { get; init; }

    public required string ContentEncoding { get; init; }

    public required byte[] Body { get; init; }

    public static async Task<ReceivedPush> ReadAsync(
        string endpoint,
        HttpRequestMessage request,
        CancellationToken ct
    ) =>
        new()
        {
            Endpoint = endpoint,
            Authorization = request.Headers.Authorization?.ToString() ?? "",
            TimeToLive = HeaderOf(request, "TTL"),
            ContentEncoding = string.Join(",", request.Content?.Headers.ContentEncoding ?? []),
            Body = request.Content is null ? [] : await request.Content.ReadAsByteArrayAsync(ct),
        };

    public string DecryptFor(string receiverPublicKey, string receiverPrivateKey, string authSecret)
    {
        var salt = Body[..SaltLength];
        var recordSize = BinaryPrimitives.ReadInt32BigEndian(Body.AsSpan(SaltLength));
        var senderKeyLength = Body[SaltLength + sizeof(int)];
        var senderPublicKey = Body[HeaderFixedLength..(HeaderFixedLength + senderKeyLength)];
        var record = Body[(HeaderFixedLength + senderKeyLength)..];
        if (record.Length > recordSize)
            throw new InvalidOperationException("The push spans more than one record.");

        var receiverKey = Base64Url.DecodeFromChars(receiverPublicKey);
        using var receiver = ECDiffieHellman.Create(
            PushKeys.ParametersOf(receiverKey, Base64Url.DecodeFromChars(receiverPrivateKey))
        );
        using var sender = ECDiffieHellman.Create(PushKeys.ParametersOf(senderPublicKey));
        var keyPrk = HKDF.Extract(
            HashAlgorithmName.SHA256,
            receiver.DeriveRawSecretAgreement(sender.PublicKey),
            Base64Url.DecodeFromChars(authSecret)
        );
        var inputKey = HKDF.Expand(
            HashAlgorithmName.SHA256,
            keyPrk,
            32,
            [.. KeyInfoLabel, .. receiverKey, .. senderPublicKey]
        );
        var contentPrk = HKDF.Extract(HashAlgorithmName.SHA256, inputKey, salt);

        return Encoding.UTF8.GetString(Unpadded(Open(record, contentPrk)));
    }

    public JsonElement PayloadFor(
        string receiverPublicKey,
        string receiverPrivateKey,
        string authSecret
    ) =>
        JsonDocument
            .Parse(DecryptFor(receiverPublicKey, receiverPrivateKey, authSecret))
            .RootElement;

    public VapidClaims VerifiedVapidClaims(string vapidPublicKey)
    {
        if (!Authorization.StartsWith(VapidScheme + " ", StringComparison.Ordinal))
            throw new InvalidOperationException($"No VAPID authorization: {Authorization}");
        var parameters = Authorization[(VapidScheme.Length + 1)..]
            .Split(',', StringSplitOptions.TrimEntries)
            .Select(part => part.Split('=', 2))
            .ToDictionary(pair => pair[0], pair => pair[1]);
        if (parameters["k"] != vapidPublicKey)
            throw new InvalidOperationException("The push names another server key.");

        var token = parameters["t"].Split('.');
        using var verifier = ECDsa.Create(
            PushKeys.ParametersOf(Base64Url.DecodeFromChars(vapidPublicKey))
        );
        var signed = verifier.VerifyData(
            Encoding.ASCII.GetBytes($"{token[0]}.{token[1]}"),
            Base64Url.DecodeFromChars(token[2]),
            HashAlgorithmName.SHA256
        );
        if (!signed)
            throw new InvalidOperationException("The VAPID token is not signed by the server key.");

        var claims = JsonDocument.Parse(Base64Url.DecodeFromChars(token[1])).RootElement;
        return new VapidClaims(
            claims.GetProperty("aud").GetString() ?? "",
            claims.GetProperty("sub").GetString() ?? "",
            DateTimeOffset.FromUnixTimeSeconds(claims.GetProperty("exp").GetInt64())
        );
    }

    private static string HeaderOf(HttpRequestMessage request, string name) =>
        request.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private static byte[] Open(byte[] record, byte[] contentPrk)
    {
        var contentKey = HKDF.Expand(
            HashAlgorithmName.SHA256,
            contentPrk,
            16,
            Encoding.ASCII.GetBytes("Content-Encoding: aes128gcm\0")
        );
        var nonce = HKDF.Expand(
            HashAlgorithmName.SHA256,
            contentPrk,
            12,
            Encoding.ASCII.GetBytes("Content-Encoding: nonce\0")
        );
        var ciphertext = record[..^TagLength];
        var plaintext = new byte[ciphertext.Length];
        using var aes = new AesGcm(contentKey, TagLength);
        aes.Decrypt(nonce, ciphertext, record[^TagLength..], plaintext);

        return plaintext;
    }

    private static byte[] Unpadded(byte[] padded)
    {
        var delimiter = Array.FindLastIndex(padded, octet => octet != 0);
        if (delimiter < 0 || padded[delimiter] != 0x02)
            throw new InvalidOperationException("The push is not the last record.");

        return padded[..delimiter];
    }
}
