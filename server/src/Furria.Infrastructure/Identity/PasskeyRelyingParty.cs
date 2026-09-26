using System.Buffers.Text;
using System.Diagnostics.Contracts;
using Furria.Application.ClubApp;
using Microsoft.AspNetCore.Identity;

namespace Furria.Infrastructure.Identity;

public static class PasskeyRelyingParty
{
    public const string AndroidOriginPrefix = "android:apk-key-hash:";

    private const string RequiredResidentKey = "required";

    public static void Configure(IdentityPasskeyOptions passkeys, ClubAppOptions clubApp)
    {
        var origins = OriginsOf(clubApp);
        passkeys.ServerDomain = DomainOf(clubApp.BaseUrl);
        passkeys.ResidentKeyRequirement = RequiredResidentKey;
        passkeys.ValidateOrigin = context =>
            ValueTask.FromResult(IsAccepted(origins, context.Origin, context.CrossOrigin));
    }

    [Pure]
    public static string DomainOf(string baseUrl) => new Uri(baseUrl).Host;

    [Pure]
    public static IReadOnlySet<string> OriginsOf(ClubAppOptions clubApp) =>
        new[] { WebOriginOf(clubApp.BaseUrl) }
            .Concat(clubApp.AndroidCertFingerprints.Select(AndroidOriginOf))
            .ToHashSet(StringComparer.Ordinal);

    [Pure]
    public static bool IsAccepted(IReadOnlySet<string> origins, string origin, bool crossOrigin) =>
        !crossOrigin && origins.Contains(origin);

    [Pure]
    private static string WebOriginOf(string baseUrl) =>
        new Uri(baseUrl).GetLeftPart(UriPartial.Authority);

    [Pure]
    private static string AndroidOriginOf(string fingerprint) =>
        AndroidOriginPrefix
        + Base64Url.EncodeToString(
            AndroidCertFingerprint.BytesOf(fingerprint)
                ?? throw new InvalidOperationException(
                    "An Android certificate fingerprint is not in the colon-separated hex form."
                )
        );
}
