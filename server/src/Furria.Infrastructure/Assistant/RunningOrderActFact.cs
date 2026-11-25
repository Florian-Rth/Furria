namespace Furria.Infrastructure.Assistant;

public sealed record RunningOrderActFact(
    int Number,
    string Name,
    string? Kind,
    string? Group,
    bool IsOwn
);
