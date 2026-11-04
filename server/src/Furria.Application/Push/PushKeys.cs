using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;

namespace Furria.Application.Push;

public static class PushKeys
{
    public const int PublicKeyLength = 65;
    public const int PrivateKeyLength = 32;
    public const int AuthSecretLength = 16;
    public const int EncodedPublicKeyLength = 87;
    public const int EncodedAuthSecretLength = 22;

    private const byte UncompressedPoint = 0x04;
    private const int CoordinateLength = 32;

    [Pure]
    public static ECParameters ParametersOf(byte[] publicKey) =>
        new()
        {
            Curve = ECCurve.NamedCurves.nistP256,
            Q = new ECPoint
            {
                X = publicKey[1..(1 + CoordinateLength)],
                Y = publicKey[(1 + CoordinateLength)..],
            },
        };

    [Pure]
    public static ECParameters ParametersOf(byte[] publicKey, byte[] privateKey) =>
        ParametersOf(publicKey) with
        {
            D = privateKey,
        };

    [Pure]
    public static byte[] PublicKeyOf(ECParameters parameters) =>
        [UncompressedPoint, .. parameters.Q.X ?? [], .. parameters.Q.Y ?? []];

    [Pure]
    public static byte[]? DecodedOrNull(string encoded)
    {
        try
        {
            return Base64Url.DecodeFromChars(encoded);
        }
        catch (FormatException)
        {
            return null;
        }
    }

    [Pure]
    public static bool IsPublicKey(string? encoded) =>
        encoded?.Length == EncodedPublicKeyLength
        && DecodedOrNull(encoded) is { Length: PublicKeyLength } key
        && key[0] == UncompressedPoint
        && Imports(ParametersOf(key));

    [Pure]
    public static bool IsAuthSecret(string? encoded) =>
        encoded?.Length == EncodedAuthSecretLength
        && DecodedOrNull(encoded) is { Length: AuthSecretLength };

    [Pure]
    public static bool ArePair(string publicKey, string privateKey) =>
        IsPublicKey(publicKey)
        && DecodedOrNull(privateKey) is { Length: PrivateKeyLength } privateBytes
        && Imports(ParametersOf(Base64Url.DecodeFromChars(publicKey), privateBytes))
        && SignsForItsPublicKey(Base64Url.DecodeFromChars(publicKey), privateBytes);

    private static bool Imports(ECParameters parameters)
    {
        try
        {
            using var key = ECDsa.Create(parameters);
            return true;
        }
        catch (CryptographicException)
        {
            return false;
        }
    }

    private static bool SignsForItsPublicKey(byte[] publicKey, byte[] privateKey)
    {
        byte[] probe = [1, 2, 3];
        using var signer = ECDsa.Create(ParametersOf(publicKey, privateKey));
        using var verifier = ECDsa.Create(ParametersOf(publicKey));

        return verifier.VerifyData(
            probe,
            signer.SignData(probe, HashAlgorithmName.SHA256),
            HashAlgorithmName.SHA256
        );
    }
}
