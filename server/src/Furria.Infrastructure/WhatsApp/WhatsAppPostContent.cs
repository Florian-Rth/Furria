namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPostContent(string Text, IReadOnlyList<string> MentionedChatIds);
