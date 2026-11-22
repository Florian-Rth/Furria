namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppAddOnLine(
    string Lead,
    string Name,
    DateTimeOffset? Until,
    string Link
);
