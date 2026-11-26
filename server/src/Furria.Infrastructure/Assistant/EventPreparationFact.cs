namespace Furria.Infrastructure.Assistant;

public sealed record EventPreparationFact(
    int EventId,
    string Title,
    ClubMomentFact Starts,
    string? Venue,
    bool IsPublished,
    bool IsCancelled,
    string? CurrentStep,
    IReadOnlyList<EventStepFact> Steps,
    IReadOnlyList<string> MissingDetails,
    string Link
);
