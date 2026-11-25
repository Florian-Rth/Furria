namespace Furria.Tests.Common.Assistant;

public sealed record FakeModelReply(
    string? Text,
    string? ToolName = null,
    string? ToolArguments = null,
    int InputTokens = FakeModelReply.DefaultInputTokens,
    int OutputTokens = FakeModelReply.DefaultOutputTokens,
    string? Thought = null
)
{
    public const int DefaultInputTokens = 1_000;
    public const int DefaultOutputTokens = 100;
    public const string DefaultText = "Alaaf! Dazu steht nichts in meinen Unterlagen.";

    public static FakeModelReply Saying(string text) => new(text);

    public static FakeModelReply Calling(string toolName, object arguments) =>
        new(null, toolName, System.Text.Json.JsonSerializer.Serialize(arguments));

    public FakeModelReply ThinkingFirst(string thought) => this with { Thought = thought };
}
