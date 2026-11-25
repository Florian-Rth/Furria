namespace Furria.Infrastructure.Assistant;

public sealed record AttendanceFact(
    int Yes,
    int Maybe,
    int No,
    ClubMomentFact? AnswersUntil,
    bool IsClosed,
    string? YourAnswer,
    string? TakenFrom
);
