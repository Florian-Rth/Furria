namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaOutgoingText
{
    public required string ChatId { get; init; }

    public required string Text { get; init; }

    public string? ReplyTo { get; init; }

    public IReadOnlyList<string> Mentions { get; init; } = [];
}
