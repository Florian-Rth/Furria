namespace Furria.Application.WhatsApp;

public sealed record WhatsAppOverviewDetails(
    WhatsAppConnectionState State,
    string? BotPhone,
    WhatsAppClubGroupDetails? ClubGroup,
    IReadOnlyList<WhatsAppGroupSummary> Groups
);
