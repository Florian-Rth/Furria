using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Api.Endpoints.Auth;

public static class PasskeyCeremonyLimits
{
    public const int ChallengeIdLength = 64;
    public const int PasskeyIdLength = 1400;
    public const string PasskeyIdPattern = "^[A-Za-z0-9_-]+$";

    private const int CredentialLength = 64 * 1024;

    [Pure]
    public static bool IsCredential(JsonElement credential) =>
        credential.ValueKind == JsonValueKind.Object
        && credential.GetRawText().Length <= CredentialLength;

    [Pure]
    public static JsonElement OptionsOf(string optionsJson)
    {
        using var document = JsonDocument.Parse(optionsJson);
        return document.RootElement.Clone();
    }
}
