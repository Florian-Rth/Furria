using System.Text;
using System.Text.Json.Nodes;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantThinkingFilter : DelegatingHandler
{
    private const string TextPart = "text";

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var response = await base.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return response;

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (JsonNode.Parse(body) is not JsonObject completion || !HasContentParts(completion))
        {
            response.Content = new StringContent(body, Encoding.UTF8, "application/json");
            return response;
        }

        foreach (var message in MessagesOf(completion))
            message["content"] = TextOf(message["content"]!.AsArray());
        response.Content = new StringContent(
            completion.ToJsonString(),
            Encoding.UTF8,
            "application/json"
        );
        return response;
    }

    private static IEnumerable<JsonObject> MessagesOf(JsonObject completion) =>
        completion["choices"] is JsonArray choices
            ? choices
                .Select(choice => choice?["message"] as JsonObject)
                .OfType<JsonObject>()
                .Where(message => message["content"] is JsonArray)
            : [];

    private static bool HasContentParts(JsonObject completion) => MessagesOf(completion).Any();

    private static string? TextOf(JsonArray parts)
    {
        var texts = parts
            .Where(part => part?["type"]?.GetValue<string>() == TextPart)
            .Select(part => part?["text"]?.GetValue<string>() ?? "")
            .ToList();
        return texts.Count == 0 ? null : string.Concat(texts);
    }
}
