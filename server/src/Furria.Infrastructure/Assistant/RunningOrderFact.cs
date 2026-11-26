namespace Furria.Infrastructure.Assistant;

public sealed record RunningOrderFact(
    string Event,
    bool IsConfirmed,
    bool MayStillChange,
    IReadOnlyList<RunningOrderActFact> Acts
);
