using System.Diagnostics.Contracts;
using System.Text.Json;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaAnswerEvents
{
    private const char KeySeparator = '_';
    private const int SerialisedKeyIndex = 2;
    private const string GroupServer = "@g.us";
    private const long LatestUnixSeconds = 253_402_300_799;
    private const long LatestUnixMilliseconds = 253_402_300_799_999;

    private static readonly IReadOnlyDictionary<string, AttendanceAnswer> EventResponses =
        new Dictionary<string, AttendanceAnswer>(StringComparer.OrdinalIgnoreCase)
        {
            ["GOING"] = AttendanceAnswer.Yes,
            ["NOT_GOING"] = AttendanceAnswer.No,
            ["MAYBE"] = AttendanceAnswer.Maybe,
        };

    [Pure]
    public static WhatsAppIncomingAnswer? Read(
        string eventName,
        string body,
        DateTimeOffset received
    )
    {
        using var document = JsonDocument.Parse(body);
        if (!document.RootElement.TryGetProperty("payload", out var payload))
            return null;

        return eventName switch
        {
            WahaEvents.PollVote => VoteOf(payload, received),
            WahaEvents.EventResponse => EventResponseOf(payload, received),
            _ => null,
        };
    }

    [Pure]
    public static string MessageKeyOf(string messageId) =>
        messageId.Split(KeySeparator) is { Length: > SerialisedKeyIndex } parts
            ? parts[SerialisedKeyIndex]
            : messageId;

    [Pure]
    private static WhatsAppIncomingAnswer? VoteOf(JsonElement payload, DateTimeOffset received) =>
        Property(payload, "vote") is { } vote
        && Property(payload, "poll") is { } poll
        && !IsFromMe(vote)
        && SenderOf(vote) is { } sender
        && WahaJson.TextOf(poll, "id") is { } pollId
            ? new WhatsAppIncomingAnswer
            {
                MessageKey = MessageKeyOf(pollId),
                SenderId = sender,
                AnsweredAt = SecondsOf(vote, "timestamp") ?? received,
                SelectedOptions = SelectedOptionsOf(vote),
            }
            : null;

    [Pure]
    private static WhatsAppIncomingAnswer? EventResponseOf(
        JsonElement payload,
        DateTimeOffset received
    ) =>
        !IsFromMe(payload)
        && SenderOf(payload) is { } sender
        && Property(payload, "eventCreationKey") is { } creation
        && WahaJson.TextOf(creation, "id") is { } eventId
        && Property(payload, "eventResponse") is { } response
            ? new WhatsAppIncomingAnswer
            {
                MessageKey = MessageKeyOf(eventId),
                SenderId = sender,
                AnsweredAt =
                    MillisecondsOf(response, "timestampMs")
                    ?? SecondsOf(payload, "timestamp")
                    ?? received,
                Attendance =
                    WahaJson.TextOf(response, "response") is { } text
                    && EventResponses.TryGetValue(text, out var answer)
                        ? answer
                        : null,
            }
            : null;

    [Pure]
    private static string? SenderOf(JsonElement message) =>
        WahaJson.TextOf(message, "participant")
        ?? (
            WahaJson.TextOf(message, "from") is { } from
            && !from.EndsWith(GroupServer, StringComparison.Ordinal)
                ? from
                : null
        );

    [Pure]
    private static bool IsFromMe(JsonElement message) =>
        message.TryGetProperty("fromMe", out var fromMe) && fromMe.ValueKind == JsonValueKind.True;

    [Pure]
    private static JsonElement? Property(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.Object
            ? value
            : null;

    [Pure]
    private static IReadOnlyList<string> SelectedOptionsOf(JsonElement vote) =>
        vote.TryGetProperty("selectedOptions", out var selected)
        && selected.ValueKind == JsonValueKind.Array
            ?
            [
                .. selected
                    .EnumerateArray()
                    .Where(option => option.ValueKind == JsonValueKind.String)
                    .Select(option => option.GetString() ?? ""),
            ]
            : [];

    [Pure]
    private static DateTimeOffset? SecondsOf(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value)
        && value.TryGetInt64(out var seconds)
        && seconds is > 0 and <= LatestUnixSeconds
            ? DateTimeOffset.FromUnixTimeSeconds(seconds)
            : null;

    [Pure]
    private static DateTimeOffset? MillisecondsOf(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value)
        && value.TryGetInt64(out var milliseconds)
        && milliseconds is > 0 and <= LatestUnixMilliseconds
            ? DateTimeOffset.FromUnixTimeMilliseconds(milliseconds)
            : null;
}
