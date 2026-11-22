namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppAddressedHost(
    string ChatId,
    WhatsAppHost Host,
    DateTimeOffset EnqueuedAt
);
