namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppMessage
{
    public const int MessageIdLength = 256;

    public long Id { get; set; }

    public string ChatId { get; set; } = "";

    public string MessageId { get; set; } = "";

    public WhatsAppHostKind HostKind { get; set; }

    public int HostId { get; set; }

    public DateTimeOffset SentAt { get; set; }
}
