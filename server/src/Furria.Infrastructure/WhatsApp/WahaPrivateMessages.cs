using System.Diagnostics.Contracts;
using System.Text.Json;
using Furria.Core.Assistant;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaPrivateMessages
{
    private const long LatestUnixSeconds = 253_402_300_799;

    [Pure]
    public static WhatsAppPrivateMessage? Read(string body, DateTimeOffset received)
    {
        using var document = JsonDocument.Parse(body);
        return
            document.RootElement.TryGetProperty("payload", out var payload)
            && payload.ValueKind == JsonValueKind.Object
            && !IsFromMe(payload)
            && PrivateChatOf(payload) is { } chatId
            && (IsTrue(payload, "hasMedia") || TextOf(payload) is not null)
            ? new WhatsAppPrivateMessage(chatId, TextOf(payload), SentAtOf(payload, received))
            : null;
    }

    [Pure]
    private static string? PrivateChatOf(JsonElement payload) =>
        WahaJson.TextOf(payload, "from") is { Length: <= ClubAssistantQuestion.ChatIdLength } from
        && (WhatsAppSenders.IsLinkedId(from) || WhatsAppSenders.PhoneDigitsOf(from) is not null)
            ? from
            : null;

    [Pure]
    private static string? TextOf(JsonElement payload) =>
        !IsTrue(payload, "hasMedia")
        && payload.TryGetProperty("body", out var body)
        && body.ValueKind == JsonValueKind.String
        && body.GetString() is { } text
        && !string.IsNullOrWhiteSpace(text)
            ? text.Trim()
            : null;

    [Pure]
    private static DateTimeOffset SentAtOf(JsonElement payload, DateTimeOffset received) =>
        TimestampOf(payload) is { } sentAt && sentAt < received ? sentAt : received;

    [Pure]
    private static DateTimeOffset? TimestampOf(JsonElement payload) =>
        payload.TryGetProperty("timestamp", out var timestamp)
        && timestamp.TryGetInt64(out var seconds)
        && seconds is > 0 and <= LatestUnixSeconds
            ? DateTimeOffset.FromUnixTimeSeconds(seconds)
            : null;

    [Pure]
    private static bool IsFromMe(JsonElement payload) => IsTrue(payload, "fromMe");

    [Pure]
    private static bool IsTrue(JsonElement payload, string property) =>
        payload.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.True;
}
