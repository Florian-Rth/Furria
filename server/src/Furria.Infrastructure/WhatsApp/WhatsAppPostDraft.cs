namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPostDraft
{
    public required string Title { get; init; }

    public required WhatsAppPostSlot? Slot { get; init; }

    public required WhatsAppPostBody? Body { get; init; }

    public required IReadOnlyDictionary<int, string> MentionablePhones { get; init; }

    public required IReadOnlyList<WhatsAppPostSchedule> Schedules { get; init; }

    public required IReadOnlyList<string> GroupNames { get; init; }

    public required string? AuthorName { get; init; }

    public required string Link { get; init; }
}
