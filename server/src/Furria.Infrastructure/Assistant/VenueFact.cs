namespace Furria.Infrastructure.Assistant;

public sealed record VenueFact(
    string Name,
    string Address,
    string? Hint,
    IReadOnlyList<OpeningHoursFact> OpeningHours
);
