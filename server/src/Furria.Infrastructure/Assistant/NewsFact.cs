namespace Furria.Infrastructure.Assistant;

public sealed record NewsFact(
    string Title,
    string Teaser,
    string Category,
    ClubMomentFact Published,
    string Link
);
