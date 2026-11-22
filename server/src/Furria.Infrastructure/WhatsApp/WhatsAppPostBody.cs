namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPostBody(string Text, bool IsRichText)
{
    public static WhatsAppPostBody Rich(string text) => new(text, IsRichText: true);

    public static WhatsAppPostBody Plain(string text) => new(text, IsRichText: false);
}
