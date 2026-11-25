using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Furria.Tests.Common.Assistant;

public sealed class FakeModelService : HttpMessageHandler
{
    private readonly ConcurrentQueue<FakeModelReply> _script = new();
    private readonly ConcurrentQueue<JsonNode> _requests = new();
    private int _failuresLeft;
    private int _callCount;

    public IReadOnlyList<JsonNode> Requests => [.. _requests];

    public void Script(params FakeModelReply[] replies)
    {
        foreach (var reply in replies)
            _script.Enqueue(reply);
    }

    public void Fail(int times) => Interlocked.Exchange(ref _failuresLeft, times);

    public IReadOnlyList<string> ToolResults() =>
        [
            .. Requests
                .LastOrDefault()
                ?["messages"]?.AsArray()
                .Where(message => message?["role"]?.GetValue<string>() == "tool")
                .Select(message => message!["content"]?.GetValue<string>() ?? "")
                ?? [],
        ];

    public IReadOnlyList<string> OfferedTools() =>
        [
            .. Requests
                .FirstOrDefault()
                ?["tools"]?.AsArray()
                .Select(tool => tool?["function"]?["name"]?.GetValue<string>() ?? "")
                ?? [],
        ];

    public string? SystemPrompt() =>
        Requests
            .FirstOrDefault()
            ?["messages"]?.AsArray()
            .FirstOrDefault(message => message?["role"]?.GetValue<string>() == "system")
            ?["content"]?.GetValue<string>();

    public void Forget()
    {
        _script.Clear();
        _requests.Clear();
        Interlocked.Exchange(ref _failuresLeft, 0);
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var body = request.Content is null
            ? "{}"
            : await request.Content.ReadAsStringAsync(cancellationToken);
        _requests.Enqueue(JsonNode.Parse(body) ?? new JsonObject());

        if (Interlocked.Decrement(ref _failuresLeft) >= 0)
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        Interlocked.Exchange(ref _failuresLeft, 0);

        var reply = _script.TryDequeue(out var scripted)
            ? scripted
            : FakeModelReply.Saying(FakeModelReply.DefaultText);
        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(
                CompletionOf(reply, Interlocked.Increment(ref _callCount)),
                Encoding.UTF8,
                "application/json"
            ),
        };
    }

    private static string CompletionOf(FakeModelReply reply, int call) =>
        JsonSerializer.Serialize(
            new
            {
                id = $"chatcmpl-{call}",
                @object = "chat.completion",
                created = 1_764_000_000,
                model = "fake-model",
                choices = new[]
                {
                    new
                    {
                        index = 0,
                        message = MessageOf(reply, call),
                        finish_reason = reply.ToolName is null ? "stop" : "tool_calls",
                    },
                },
                usage = new
                {
                    prompt_tokens = reply.InputTokens,
                    completion_tokens = reply.OutputTokens,
                    total_tokens = reply.InputTokens + reply.OutputTokens,
                },
            }
        );

    private static object MessageOf(FakeModelReply reply, int call) =>
        reply.ToolName is { } toolName
            ? new
            {
                role = "assistant",
                content = (string?)null,
                tool_calls = new[]
                {
                    new
                    {
                        id = $"call_{call}",
                        type = "function",
                        function = new { name = toolName, arguments = reply.ToolArguments ?? "{}" },
                    },
                },
            }
            : new
            {
                role = "assistant",
                content = reply.Text,
                tool_calls = (object[]?)null,
            };
}
