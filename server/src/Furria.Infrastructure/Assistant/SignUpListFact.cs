namespace Furria.Infrastructure.Assistant;

public sealed record SignUpListFact(
    string Title,
    string? Hint,
    ClubMomentFact? SignUpUntil,
    bool IsClosed,
    int Lines,
    IReadOnlyList<string> OtherLineTexts,
    bool YouSignedUp,
    string? YourLine,
    string? TakenFrom
);
