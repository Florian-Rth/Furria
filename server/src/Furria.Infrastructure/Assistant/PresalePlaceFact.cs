namespace Furria.Infrastructure.Assistant;

public sealed record PresalePlaceFact(
    string Name,
    string Address,
    string? Hint,
    IReadOnlyList<OpeningHoursFact> OpeningHours
);
