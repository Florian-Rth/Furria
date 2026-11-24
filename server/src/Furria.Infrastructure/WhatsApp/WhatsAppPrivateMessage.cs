namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPrivateMessage(string ChatId, string? Text, DateTimeOffset SentAt)
{
    public bool IsText => Text is not null;
}
