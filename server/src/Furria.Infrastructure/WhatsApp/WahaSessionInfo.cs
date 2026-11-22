namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaSessionInfo(WhatsAppSessionStatus? Status, string? AccountId);
