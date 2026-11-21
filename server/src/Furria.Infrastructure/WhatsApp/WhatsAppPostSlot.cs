namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppPostSlot(
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    string? VenueName
);
