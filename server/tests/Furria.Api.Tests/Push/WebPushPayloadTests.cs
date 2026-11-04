using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Furria.Infrastructure.Push;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class WebPushPayloadTests
{
    private const string Plaintext = "When I grow up, I want to be a watermelon";
    private const string SenderPublicKey =
        "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
    private const string SenderPrivateKey = "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw";
    private const string ReceiverPublicKey =
        "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";
    private const string AuthSecret = "BTBZMqHH6r4Tts7J_aSIgg";
    private const string Salt = "DGv6ra1nlYgDCS1FRnbzlw";
    private const string EncryptedBody =
        "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN";

    [Fact]
    public void Should_ProduceTheRfc8291Example_When_EncryptingItsInputs()
    {
        using var sender = SenderOf(SenderPublicKey, SenderPrivateKey);

        var body = WebPushPayload.Encrypt(
            Encoding.UTF8.GetBytes(Plaintext),
            new PushReceiverKeys(
                Base64Url.DecodeFromChars(ReceiverPublicKey),
                Base64Url.DecodeFromChars(AuthSecret)
            ),
            sender,
            Base64Url.DecodeFromChars(Salt)
        );

        Assert.Equal(EncryptedBody, Base64Url.EncodeToString(body));
    }

    private static ECDiffieHellman SenderOf(string publicKey, string privateKey)
    {
        var point = Base64Url.DecodeFromChars(publicKey);
        return ECDiffieHellman.Create(
            new ECParameters
            {
                Curve = ECCurve.NamedCurves.nistP256,
                D = Base64Url.DecodeFromChars(privateKey),
                Q = new ECPoint { X = point[1..33], Y = point[33..] },
            }
        );
    }
}
