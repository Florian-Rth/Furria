namespace Furria.Infrastructure.Assistant;

public sealed record AnnouncementFact(
    int AnnouncementId,
    string Title,
    string Text,
    ClubMomentFact Published,
    string? ValidUntil,
    IReadOnlyList<string> AddOns,
    string Link
);
