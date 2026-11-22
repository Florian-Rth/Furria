namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppLateAnswer
{
    public long Id { get; set; }

    public long WhatsAppMessageId { get; set; }

    public string SenderId { get; set; } = "";

    public DateTimeOffset ToldAt { get; set; }

    public WhatsAppMessage? WhatsAppMessage { get; set; }
}
