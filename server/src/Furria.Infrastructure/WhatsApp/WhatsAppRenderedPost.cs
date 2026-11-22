namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppRenderedPost(
    WhatsAppHost Host,
    WhatsAppPostContent Post,
    IReadOnlyList<WhatsAppAddOnMessage> AddOns,
    WhatsAppPostSlot? Slot
);
