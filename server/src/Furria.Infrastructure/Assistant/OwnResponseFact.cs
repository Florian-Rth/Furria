namespace Furria.Infrastructure.Assistant;

public sealed record OwnResponseFact(
    string Title,
    ClubMomentFact? Starts,
    string Answer,
    string Link
);
