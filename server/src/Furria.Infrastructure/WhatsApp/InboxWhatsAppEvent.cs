namespace Furria.Infrastructure.WhatsApp;

public sealed class InboxWhatsAppEvent
{
    public const int RequestIdLength = 128;
    public const int EventLength = 64;

    public long Id { get; set; }

    public string RequestId { get; set; } = "";

    public string Event { get; set; } = "";

    public string Session { get; set; } = "";

    public DateTimeOffset OccurredAt { get; set; }

    public DateTimeOffset ReceivedAt { get; set; }

    public string Body { get; set; } = "";

    public int Attempt { get; set; } = 1;

    public DateTimeOffset? NextAttemptAt { get; set; }

    public DateTimeOffset? ProcessedAt { get; set; }
}
