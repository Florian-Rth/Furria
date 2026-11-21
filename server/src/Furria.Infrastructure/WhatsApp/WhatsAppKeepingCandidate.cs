namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppKeepingCandidate(
    int PersonId,
    string Phone,
    string? HeldDigits,
    WhatsAppGroupAddState? HeldState
);
