namespace Furria.Infrastructure.Assistant;

public sealed record TablePlanFact(
    int EventId,
    string Title,
    ClubMomentFact Starts,
    bool NeedsTablePlan,
    bool HasTablePlan,
    string? Hall,
    int Tables,
    int Chairs,
    string Link
);
