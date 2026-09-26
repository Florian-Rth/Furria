using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public static class InvitationTokenLimits
{
    public const int Length = 128;
    public const int CodeLength = InvitationCode.PresentedMaxLength;
    public const string CredentialField = "token";
    public const string ExactlyOneCredentialMessage =
        "Gib entweder den Link aus der Einladung oder den Code an.";

    public static bool HasExactlyOneCredential(string? token, string? code) =>
        token is null != code is null;
}
