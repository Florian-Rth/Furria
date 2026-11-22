using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaParticipantsEvents
{
    private const string JoinType = "join";

    [Pure]
    public static WahaParticipantsEvent? Read(string body)
    {
        try
        {
            using var document = JsonDocument.Parse(body);
            return document.RootElement.TryGetProperty("payload", out var payload)
                ? Of(payload)
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    [Pure]
    private static WahaParticipantsEvent? Of(JsonElement payload) =>
        payload.ValueKind == JsonValueKind.Object
        && payload.TryGetProperty("group", out var group)
        && WahaJson.TextOf(group, "id") is { } groupChatId
            ? new WahaParticipantsEvent(
                groupChatId,
                WahaJson.TextOf(payload, "type") == JoinType,
                ParticipantIdsOf(payload)
            )
            : null;

    [Pure]
    private static IReadOnlyList<string> ParticipantIdsOf(JsonElement payload) =>
        payload.TryGetProperty("participants", out var participants)
        && participants.ValueKind == JsonValueKind.Array
            ?
            [
                .. participants
                    .EnumerateArray()
                    .Select(participant => WahaJson.TextOf(participant, "pn", "id"))
                    .OfType<string>(),
            ]
            : [];
}
