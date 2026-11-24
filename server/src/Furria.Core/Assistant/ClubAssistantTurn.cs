namespace Furria.Core.Assistant;

public sealed record ClubAssistantTurn(
    ClubAssistantSpeaker Speaker,
    string Text,
    DateTimeOffset At
);
