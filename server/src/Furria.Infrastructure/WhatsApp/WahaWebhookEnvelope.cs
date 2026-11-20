using System.Diagnostics.Contracts;
using System.Text;
using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaWebhookEnvelope(string Event, string Session, DateTimeOffset OccurredAt)
{
    private const string EventProperty = "event";
    private const string SessionProperty = "session";
    private const string TimestampProperty = "timestamp";
    private const long LatestUnixMilliseconds = 253_402_300_799_999;
    private const string NullCharacterEscape = "\\u0000";

    [Pure]
    public static WahaWebhookEnvelope? Read(byte[] body)
    {
        if (Encoding.UTF8.GetString(body).Contains(NullCharacterEscape, StringComparison.Ordinal))
            return null;

        try
        {
            using var document = JsonDocument.Parse(body);
            return Of(document.RootElement);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    [Pure]
    private static WahaWebhookEnvelope? Of(JsonElement root) =>
        root.ValueKind == JsonValueKind.Object
        && TextOf(root, EventProperty, InboxWhatsAppEvent.EventLength) is { } eventName
        && TextOf(root, SessionProperty, WhatsAppSession.NameLength) is { } session
        && root.TryGetProperty(TimestampProperty, out var timestamp)
        && timestamp.TryGetInt64(out var milliseconds)
        && milliseconds is > 0 and <= LatestUnixMilliseconds
            ? new WahaWebhookEnvelope(
                eventName,
                session,
                DateTimeOffset.FromUnixTimeMilliseconds(milliseconds)
            )
            : null;

    [Pure]
    private static string? TextOf(JsonElement root, string property, int longest) =>
        root.TryGetProperty(property, out var value)
        && value.ValueKind == JsonValueKind.String
        && value.GetString() is { Length: > 0 } text
        && text.Length <= longest
            ? text
            : null;
}
