namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppTargeting(WhatsAppOperation Operation, string MessageId, string Text)
{
    public static WhatsAppTargeting Edit(string messageId, string text) =>
        new(WhatsAppOperation.EditText, messageId, text);

    public static WhatsAppTargeting ReplyTo(string messageId, string text) =>
        new(WhatsAppOperation.Reply, messageId, text);

    public static WhatsAppTargeting Delete(string messageId) =>
        new(WhatsAppOperation.Delete, messageId, "");
}
