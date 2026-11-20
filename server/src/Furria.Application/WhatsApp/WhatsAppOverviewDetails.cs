namespace Furria.Application.WhatsApp;

public sealed record WhatsAppOverviewDetails(
    WhatsAppConnectionState State,
    string? BotPhone,
    string? ClubChatId,
    IReadOnlyList<WhatsAppGroupSummary> Groups
);
