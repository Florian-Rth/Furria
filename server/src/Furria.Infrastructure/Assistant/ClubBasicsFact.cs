namespace Furria.Infrastructure.Assistant;

public sealed record ClubBasicsFact(
    string? Name,
    int? FoundedYear,
    string CurrentSession,
    string? SessionMotto,
    ClubMomentFact Now
);
