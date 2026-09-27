using System.Buffers.Binary;
using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Text;

namespace Furria.Infrastructure.Identity;

public static class PasswordResetLink
{
    public const int PresentedMaxLength = 1024;

    private const string ResetLinkPath = "/reset-password#reset=";
    private const int AccountIdLength = sizeof(int);

    private static readonly UTF8Encoding StrictUtf8 = new(
        encoderShouldEmitUTF8Identifier: false,
        throwOnInvalidBytes: true
    );

    [Pure]
    public static string LinkOf(string clubAppBaseUrl, int accountId, string token) =>
        $"{clubAppBaseUrl.TrimEnd('/')}{ResetLinkPath}{Encode(accountId, token)}";

    [Pure]
    public static PasswordResetCredential? Read(string presented)
    {
        if (
            presented.Length > PresentedMaxLength
            || !Base64Url.IsValid(presented, out var decodedLength)
            || decodedLength <= AccountIdLength
        )
            return null;

        var blob = Base64Url.DecodeFromChars(presented);
        var accountId = BinaryPrimitives.ReadInt32BigEndian(blob);

        return accountId > 0 && TokenOf(blob.AsSpan(AccountIdLength)) is { } token
            ? new PasswordResetCredential(accountId, token)
            : null;
    }

    [Pure]
    private static string Encode(int accountId, string token)
    {
        var tokenBytes = StrictUtf8.GetBytes(token);
        var blob = new byte[AccountIdLength + tokenBytes.Length];
        BinaryPrimitives.WriteInt32BigEndian(blob, accountId);
        tokenBytes.CopyTo(blob.AsSpan(AccountIdLength));

        return Base64Url.EncodeToString(blob);
    }

    [Pure]
    private static string? TokenOf(ReadOnlySpan<byte> tokenBytes)
    {
        try
        {
            return StrictUtf8.GetString(tokenBytes);
        }
        catch (DecoderFallbackException)
        {
            return null;
        }
    }
}
