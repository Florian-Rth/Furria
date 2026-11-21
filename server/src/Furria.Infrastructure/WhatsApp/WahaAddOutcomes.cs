using System.Diagnostics.Contracts;
using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaAddOutcomes
{
    private const int AlreadyInGroupCode = 409;
    private const int FirstRefusalCode = 400;

    private static readonly string[] CodeProperties = ["error", "Error", "status", "code"];
    private static readonly string[] ListProperties = ["participants", "Participants"];

    [Pure]
    public static WahaAddOutcome Of(JsonElement answer) =>
        CodesOf(answer).ToList() switch
        {
            var codes when codes.Contains(AlreadyInGroupCode) => WahaAddOutcome.AlreadyInGroup,
            var codes when codes.Any(code => code >= FirstRefusalCode) => WahaAddOutcome.Refused,
            _ => WahaAddOutcome.Added,
        };

    [Pure]
    private static IEnumerable<int> CodesOf(JsonElement answer) =>
        answer.ValueKind switch
        {
            JsonValueKind.Array => answer.EnumerateArray().SelectMany(CodesOf),
            JsonValueKind.Object => ListOf(answer) is { } list ? CodesOf(list)
            : CodeOf(answer) is { } code ? [code]
            : [],
            _ => [],
        };

    [Pure]
    private static JsonElement? ListOf(JsonElement answer)
    {
        foreach (var property in ListProperties)
            if (
                answer.TryGetProperty(property, out var list)
                && list.ValueKind == JsonValueKind.Array
            )
                return list;

        return null;
    }

    [Pure]
    private static int? CodeOf(JsonElement participant)
    {
        foreach (var property in CodeProperties)
            if (participant.TryGetProperty(property, out var value) && NumberOf(value) is { } code)
                return code;

        return null;
    }

    [Pure]
    private static int? NumberOf(JsonElement value) =>
        value.ValueKind switch
        {
            JsonValueKind.Number when value.TryGetInt32(out var number) => number,
            JsonValueKind.String when int.TryParse(value.GetString(), out var number) => number,
            _ => null,
        };
}
