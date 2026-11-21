namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPostSchedule(string? Title, IReadOnlyList<WhatsAppPostStep> Steps);
