using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaJson
{
    private const string SerializedProperty = "_serialized";

    [Pure]
    public static string? TextOf(JsonElement element, params ReadOnlySpan<string> properties)
    {
        if (element.ValueKind != JsonValueKind.Object)
            return null;

        foreach (var property in properties)
            if (element.TryGetProperty(property, out var value) && IdTextOf(value) is { } text)
                return text;

        return null;
    }

    [Pure]
    public static string? MessageIdOf(JsonElement sent) =>
        TextOf(sent, "id")
        ?? (
            sent.ValueKind == JsonValueKind.Object && sent.TryGetProperty("key", out var key)
                ? TextOf(key, "id")
                : null
        );

    [Pure]
    public static string? SessionStatusOf(string body)
    {
        using var document = JsonDocument.Parse(body);
        return document.RootElement.TryGetProperty("payload", out var payload)
            ? TextOf(payload, "status")
            : null;
    }

    [Pure]
    private static string? IdTextOf(JsonElement value) =>
        value.ValueKind switch
        {
            JsonValueKind.String when value.GetString() is { Length: > 0 } text => text,
            JsonValueKind.Object => TextOf(value, SerializedProperty),
            _ => null,
        };
}
