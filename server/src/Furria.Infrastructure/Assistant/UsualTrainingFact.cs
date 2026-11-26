namespace Furria.Infrastructure.Assistant;

public sealed record UsualTrainingFact(
    string Group,
    ClubMomentFact Starts,
    string EndsAt,
    int DurationMinutes,
    string? Venue
);
