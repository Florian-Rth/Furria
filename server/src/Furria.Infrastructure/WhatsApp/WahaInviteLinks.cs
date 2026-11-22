using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaInviteLinks
{
    private const string InviteBase = "https://chat.whatsapp.com/";

    [Pure]
    public static string? Of(JsonElement answer) =>
        LinkOf(
            answer.ValueKind == JsonValueKind.String
                ? answer.GetString()
                : WahaJson.TextOf(answer, "url", "link", "inviteCode", "code")
        );

    [Pure]
    private static string? LinkOf(string? code) =>
        code?.Trim() switch
        {
            null or "" => null,
            var full when full.StartsWith("https://", StringComparison.Ordinal) => full,
            var bare => InviteBase + bare,
        }
            is { Length: <= LinkedWhatsAppGroup.InviteLinkLength } link
            ? link
            : null;
}
