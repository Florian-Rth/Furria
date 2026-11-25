namespace Furria.Infrastructure.Assistant;

public sealed record AnnouncementFact(
    string Title,
    string Text,
    ClubMomentFact Published,
    string? ValidUntil,
    string Link
);
