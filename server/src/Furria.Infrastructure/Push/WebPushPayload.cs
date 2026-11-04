using System.Buffers.Binary;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using Furria.Application.Push;

namespace Furria.Infrastructure.Push;

public static class WebPushPayload
{
    public const int SaltLength = 16;
    public const int MaxPlaintextLength = RecordSize - TagLength - 1;

    private const int RecordSize = 4096;
    private const byte PublicKeyLength = 65;
    private const int ContentKeyLength = 16;
    private const int NonceLength = 12;
    private const int TagLength = 16;
    private const int InputKeyLength = 32;
    private const byte LastRecordDelimiter = 0x02;

    private static readonly byte[] KeyInfoLabel = Encoding.ASCII.GetBytes("WebPush: info\0");
    private static readonly byte[] ContentKeyInfo = Encoding.ASCII.GetBytes(
        "Content-Encoding: aes128gcm\0"
    );
    private static readonly byte[] NonceInfo = Encoding.ASCII.GetBytes("Content-Encoding: nonce\0");

    [Pure]
    public static byte[] Encrypt(
        ReadOnlySpan<byte> plaintext,
        PushReceiverKeys receiver,
        ECDiffieHellman sender,
        ReadOnlySpan<byte> salt
    )
    {
        ArgumentOutOfRangeException.ThrowIfGreaterThan(plaintext.Length, MaxPlaintextLength);
        var senderPublicKey = PushKeys.PublicKeyOf(sender.ExportParameters(false));
        var inputKey = InputKeyOf(receiver, sender, senderPublicKey);
        var contentPrk = HKDF.Extract(HashAlgorithmName.SHA256, inputKey, salt.ToArray());
        var contentKey = HKDF.Expand(
            HashAlgorithmName.SHA256,
            contentPrk,
            ContentKeyLength,
            ContentKeyInfo
        );
        var nonce = HKDF.Expand(HashAlgorithmName.SHA256, contentPrk, NonceLength, NonceInfo);

        return [.. HeaderOf(salt, senderPublicKey), .. Seal(plaintext, contentKey, nonce)];
    }

    private static byte[] InputKeyOf(
        PushReceiverKeys receiver,
        ECDiffieHellman sender,
        byte[] senderPublicKey
    )
    {
        using var receiverKey = ECDiffieHellman.Create(PushKeys.ParametersOf(receiver.PublicKey));
        var sharedSecret = sender.DeriveRawSecretAgreement(receiverKey.PublicKey);
        var keyPrk = HKDF.Extract(HashAlgorithmName.SHA256, sharedSecret, receiver.AuthSecret);
        byte[] keyInfo = [.. KeyInfoLabel, .. receiver.PublicKey, .. senderPublicKey];

        return HKDF.Expand(HashAlgorithmName.SHA256, keyPrk, InputKeyLength, keyInfo);
    }

    [Pure]
    private static byte[] HeaderOf(ReadOnlySpan<byte> salt, byte[] senderPublicKey)
    {
        var recordSize = new byte[sizeof(int)];
        BinaryPrimitives.WriteInt32BigEndian(recordSize, RecordSize);

        return [.. salt, .. recordSize, PublicKeyLength, .. senderPublicKey];
    }

    private static byte[] Seal(ReadOnlySpan<byte> plaintext, byte[] contentKey, byte[] nonce)
    {
        byte[] padded = [.. plaintext, LastRecordDelimiter];
        var ciphertext = new byte[padded.Length];
        var tag = new byte[TagLength];
        using var aes = new AesGcm(contentKey, TagLength);
        aes.Encrypt(nonce, padded, ciphertext, tag);

        return [.. ciphertext, .. tag];
    }
}
