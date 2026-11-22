namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaParticipantsEvent(
    string GroupChatId,
    bool IsJoin,
    IReadOnlyList<string> ParticipantIds
);
