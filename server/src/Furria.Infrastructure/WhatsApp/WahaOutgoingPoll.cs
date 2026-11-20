namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaOutgoingPoll
{
    public required string ChatId { get; init; }

    public required string Question { get; init; }

    public required IReadOnlyList<string> Options { get; init; }

    public required bool AllowsSeveralAnswers { get; init; }

    public string? ReplyTo { get; init; }
}
