namespace Furria.Infrastructure.Assistant;

public sealed record PollFact(
    string Question,
    bool AllowsSeveralChoices,
    bool IsAnonymous,
    ClubMomentFact? VotesUntil,
    bool IsClosed,
    int Voters,
    IReadOnlyList<PollOptionFact> Options,
    string? TakenFrom
);
