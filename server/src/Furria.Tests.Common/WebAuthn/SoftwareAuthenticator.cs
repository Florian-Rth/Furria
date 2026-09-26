using System.Buffers.Binary;
using System.Buffers.Text;
using System.Formats.Cbor;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Furria.Tests.Common.WebAuthn;

public sealed class SoftwareAuthenticator : IDisposable
{
    private const byte UserPresent = 0x01;
    private const byte UserVerified = 0x04;
    private const byte AttestedCredentialData = 0x40;
    private const int CoseKeyTypeLabel = 1;
    private const int CoseAlgorithmLabel = 3;
    private const int CoseCurveLabel = -1;
    private const int CoseXLabel = -2;
    private const int CoseYLabel = -3;
    private const int CoseKeyTypeEc2 = 2;
    private const int CoseAlgorithmEs256 = -7;
    private const int CoseCurveP256 = 1;
    private const string PublicKeyType = "public-key";
    private const string PlatformAttachment = "platform";

    private static readonly byte[] ZeroAaguid = new byte[16];

    private readonly ECDsa _key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
    private byte[] _userHandle = [];

    public byte[] CredentialId { get; } = RandomNumberGenerator.GetBytes(16);

    public string PasskeyId => Base64Url.EncodeToString(CredentialId);

    public JsonElement Create(JsonElement creationOptions, string origin)
    {
        var rpId = creationOptions.GetProperty("rp").GetProperty("id").GetString() ?? "";
        var challenge = creationOptions.GetProperty("challenge").GetString() ?? "";
        _userHandle = Base64Url.DecodeFromChars(
            creationOptions.GetProperty("user").GetProperty("id").GetString()
        );

        var clientData = ClientDataOf("webauthn.create", challenge, origin);
        byte[] authenticatorData =
        [
            .. SHA256.HashData(Encoding.UTF8.GetBytes(rpId)),
            UserPresent | UserVerified | AttestedCredentialData,
            .. SignCount(),
            .. ZeroAaguid,
            .. CredentialIdLength(),
            .. CredentialId,
            .. CosePublicKey(),
        ];

        return JsonSerializer.SerializeToElement(
            new
            {
                id = PasskeyId,
                rawId = PasskeyId,
                type = PublicKeyType,
                response = new
                {
                    clientDataJSON = Base64Url.EncodeToString(clientData),
                    attestationObject = Base64Url.EncodeToString(
                        NoneAttestation(authenticatorData)
                    ),
                    transports = new[] { "internal" },
                },
                clientExtensionResults = new { },
                authenticatorAttachment = PlatformAttachment,
            }
        );
    }

    public JsonElement Assert(JsonElement requestOptions, string origin)
    {
        var rpId = requestOptions.GetProperty("rpId").GetString() ?? "";
        var challenge = requestOptions.GetProperty("challenge").GetString() ?? "";

        var clientData = ClientDataOf("webauthn.get", challenge, origin);
        byte[] authenticatorData =
        [
            .. SHA256.HashData(Encoding.UTF8.GetBytes(rpId)),
            UserPresent | UserVerified,
            .. SignCount(),
        ];
        var signature = _key.SignData(
            [.. authenticatorData, .. SHA256.HashData(clientData)],
            HashAlgorithmName.SHA256,
            DSASignatureFormat.Rfc3279DerSequence
        );

        return JsonSerializer.SerializeToElement(
            new
            {
                id = PasskeyId,
                rawId = PasskeyId,
                type = PublicKeyType,
                response = new
                {
                    clientDataJSON = Base64Url.EncodeToString(clientData),
                    authenticatorData = Base64Url.EncodeToString(authenticatorData),
                    signature = Base64Url.EncodeToString(signature),
                    userHandle = Base64Url.EncodeToString(_userHandle),
                },
                clientExtensionResults = new { },
                authenticatorAttachment = PlatformAttachment,
            }
        );
    }

    public void Dispose() => _key.Dispose();

    private static byte[] ClientDataOf(string type, string challenge, string origin) =>
        JsonSerializer.SerializeToUtf8Bytes(
            new
            {
                type,
                challenge,
                origin,
                crossOrigin = false,
            }
        );

    private static byte[] SignCount() => new byte[4];

    private byte[] CredentialIdLength()
    {
        var length = new byte[2];
        BinaryPrimitives.WriteUInt16BigEndian(length, (ushort)CredentialId.Length);
        return length;
    }

    private byte[] CosePublicKey()
    {
        var point = _key.ExportParameters(includePrivateParameters: false).Q;
        var writer = new CborWriter(CborConformanceMode.Ctap2Canonical);
        writer.WriteStartMap(5);
        writer.WriteInt32(CoseKeyTypeLabel);
        writer.WriteInt32(CoseKeyTypeEc2);
        writer.WriteInt32(CoseAlgorithmLabel);
        writer.WriteInt32(CoseAlgorithmEs256);
        writer.WriteInt32(CoseCurveLabel);
        writer.WriteInt32(CoseCurveP256);
        writer.WriteInt32(CoseXLabel);
        writer.WriteByteString(point.X ?? []);
        writer.WriteInt32(CoseYLabel);
        writer.WriteByteString(point.Y ?? []);
        writer.WriteEndMap();
        return writer.Encode();
    }

    private static byte[] NoneAttestation(byte[] authenticatorData)
    {
        var writer = new CborWriter(CborConformanceMode.Ctap2Canonical);
        writer.WriteStartMap(3);
        writer.WriteTextString("fmt");
        writer.WriteTextString("none");
        writer.WriteTextString("attStmt");
        writer.WriteStartMap(0);
        writer.WriteEndMap();
        writer.WriteTextString("authData");
        writer.WriteByteString(authenticatorData);
        writer.WriteEndMap();
        return writer.Encode();
    }
}
