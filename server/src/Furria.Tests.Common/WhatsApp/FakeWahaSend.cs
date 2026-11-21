namespace Furria.Tests.Common.WhatsApp;

public sealed record FakeWahaSend(
    string Kind,
    string ChatId,
    string Text,
    IReadOnlyList<string> Mentions,
    string MessageId
)
{
    public IReadOnlyList<string> Options { get; init; } = [];

    public bool AllowsSeveralAnswers { get; init; }

    public long? StartTime { get; init; }

    public long? EndTime { get; init; }

    public string? Place { get; init; }
}
