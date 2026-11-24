using System.Diagnostics.Contracts;
using System.Text.Encodings.Web;
using System.Text.Json;
using Furria.Core.Assistant;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantDialogue
{
    public const int MostModelCalls = 6;
    public const int MostOutputTokens = 600;

    private const string UnknownToolResult = "Dieses Werkzeug gibt es nicht.";
    private const string FailedToolResult =
        "Das Werkzeug konnte die Daten nicht liefern. Sag, dass du es gerade nicht weißt.";

    private static readonly TimeSpan ModelCallTimeout = TimeSpan.FromSeconds(60);

    private static readonly JsonSerializerOptions ResultOptions = new(
        AIJsonUtilities.DefaultOptions
    )
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        WriteIndented = false,
    };

    private readonly ClubAssistantBudget _budget;
    private readonly ILogger<ClubAssistantDialogue> _logger;

    public ClubAssistantDialogue(ClubAssistantBudget budget, ILogger<ClubAssistantDialogue> logger)
    {
        _budget = budget;
        _logger = logger;
    }

    public async Task<ClubAssistantOutcome> ConverseAsync(
        IChatClient chat,
        IList<ChatMessage> messages,
        IReadOnlyList<AIFunction> tools,
        CancellationToken ct
    )
    {
        var options = new ChatOptions { Tools = [.. tools], MaxOutputTokens = MostOutputTokens };
        for (var call = 0; call < MostModelCalls; call++)
        {
            if (!await _budget.HasBudgetLeftAsync(ct))
                return ClubAssistantOutcome.BudgetUsedUp;

            if (await RespondAsync(chat, messages, options, ct) is not { } response)
                return ClubAssistantOutcome.ProviderFailed;

            await _budget.BookAsync(TokensOf(response.Usage), ct);
            messages.AddMessages(response);

            var calls = CallsOf(response);
            if (calls.Count == 0)
                return string.IsNullOrWhiteSpace(response.Text)
                    ? ClubAssistantOutcome.ProviderFailed
                    : ClubAssistantOutcome.Answered(response.Text.Trim());

            messages.Add(new ChatMessage(ChatRole.Tool, await ResultsOfAsync(calls, tools, ct)));
        }

        return ClubAssistantOutcome.ProviderFailed;
    }

    private async Task<ChatResponse?> RespondAsync(
        IChatClient chat,
        IList<ChatMessage> messages,
        ChatOptions options,
        CancellationToken ct
    )
    {
        using var patience = CancellationTokenSource.CreateLinkedTokenSource(ct);
        patience.CancelAfter(ModelCallTimeout);
        try
        {
            return await chat.GetResponseAsync(messages, options, patience.Token);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            _logger.LogWarning(exception, "Club assistant model call failed");
            return null;
        }
    }

    private async Task<IList<AIContent>> ResultsOfAsync(
        IReadOnlyList<FunctionCallContent> calls,
        IReadOnlyList<AIFunction> tools,
        CancellationToken ct
    )
    {
        var results = new List<AIContent>();
        foreach (var call in calls)
            results.Add(
                new FunctionResultContent(call.CallId, TextOf(await InvokeAsync(call, tools, ct)))
            );
        return results;
    }

    private async Task<object?> InvokeAsync(
        FunctionCallContent call,
        IReadOnlyList<AIFunction> tools,
        CancellationToken ct
    )
    {
        if (tools.FirstOrDefault(tool => tool.Name == call.Name) is not { } tool)
            return UnknownToolResult;

        try
        {
            return await tool.InvokeAsync(new AIFunctionArguments(call.Arguments), ct);
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            _logger.LogWarning(exception, "Club assistant tool {Tool} failed", call.Name);
            return FailedToolResult;
        }
    }

    [Pure]
    private static string TextOf(object? result) =>
        result as string ?? JsonSerializer.Serialize(result, ResultOptions);

    [Pure]
    private static IReadOnlyList<FunctionCallContent> CallsOf(ChatResponse response) =>
        [
            .. response
                .Messages.SelectMany(message => message.Contents)
                .OfType<FunctionCallContent>(),
        ];

    [Pure]
    private static ClubAssistantTokens TokensOf(UsageDetails? usage) =>
        new(
            CountOf(usage?.InputTokenCount),
            CountOf(usage?.CachedInputTokenCount),
            CountOf(usage?.OutputTokenCount)
        );

    [Pure]
    private static int CountOf(long? tokens) => (int)Math.Clamp(tokens ?? 0, 0, int.MaxValue);
}
