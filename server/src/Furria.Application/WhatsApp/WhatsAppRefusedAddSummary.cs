namespace Furria.Application.WhatsApp;

public sealed record WhatsAppRefusedAddSummary(
    int PersonId,
    string FirstName,
    string LastName,
    string? Phone,
    DateTimeOffset RefusedAt
);
