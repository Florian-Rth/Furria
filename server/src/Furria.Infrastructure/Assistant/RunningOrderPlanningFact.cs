namespace Furria.Infrastructure.Assistant;

public sealed record RunningOrderPlanningFact(
    int EventId,
    string Title,
    ClubMomentFact Starts,
    bool HasRunningOrder,
    int PlacedActs,
    int UnplacedActs,
    int Conflicts,
    int Hints,
    bool IsConfirmed,
    bool ChangedSinceConfirmed,
    string Link
);
