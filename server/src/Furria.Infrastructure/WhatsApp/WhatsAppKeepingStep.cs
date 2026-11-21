namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppKeepingStep(
    int PersonId,
    string PhoneDigits,
    WhatsAppGroupAddState State
);
