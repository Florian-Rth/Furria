namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppAddOnMessage
{
    public required WhatsAppOperation Operation { get; init; }

    public required string Text { get; init; }

    public IReadOnlyList<string> PollOptions { get; init; } = [];

    public IReadOnlyList<int> PollOptionIds { get; init; } = [];

    public bool AllowsSeveralAnswers { get; init; }

    public WhatsAppPostSlot? EventSlot { get; init; }

    public required WhatsAppAddOnKind AddOnKind { get; init; }

    public required int? AddOnId { get; init; }
}
